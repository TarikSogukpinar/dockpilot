import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/database.service';
import { GetMeResponseDto } from './dto/get-me.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { AccountType } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMe(userId: number): Promise<GetMeResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          select: {
            company: true,
            phone: true,
            address: true,
            avatarUrl: true,
            bio: true,
            jobTitle: true,
            department: true,
            website: true,
            github: true,
            theme: true,
            language: true,
            timeZone: true,
            lastLogin: true,
            lastActivity: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update last activity
    await this.prismaService.profile.update({
      where: { userId: user.id },
      data: { lastActivity: new Date() },
    });

    return user;
  }

  async getUserStats(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        connections: {
          include: {
            containers: true,
          },
        },
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const totalConnections = user.connections.length;
    const totalContainers = user.connections.reduce(
      (acc, conn) => acc + conn.containers.length,
      0,
    );
    const activeContainers = user.connections.reduce(
      (acc, conn) =>
        acc +
        conn.containers.filter((container) => container.status === 'RUNNING')
          .length,
      0,
    );

    // Update profile statistics
    await this.prismaService.profile.update({
      where: { userId: user.id },
      data: {
        totalConnections,
        totalContainers,
        activeContainers,
      },
    });

    return {
      totalConnections,
      totalContainers,
      activeContainers,
      accountType: user.accountType,
      profile: user.profile,
    };
  }

  async getUserActivity(userId: number) {
    const logs = await this.prismaService.log.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 50, // Last 50 activities
    });

    return logs;
  }

  async searchUsers(query: string) {
    return this.prismaService.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
          {
            profile: {
              OR: [
                { company: { contains: query, mode: 'insensitive' } },
                { jobTitle: { contains: query, mode: 'insensitive' } },
                { department: { contains: query, mode: 'insensitive' } },
              ],
            },
          },
        ],
      },
      select: {
        id: true,
        uuid: true,
        email: true,
        name: true,
        role: true,
        profile: {
          select: {
            company: true,
            jobTitle: true,
            department: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedProfile = await this.prismaService.profile.upsert({
      where: { userId },
      create: {
        ...updateProfileDto,
        userId,
      },
      update: updateProfileDto,
    });

    return updatedProfile;
  }

  async updatePreferences(userId: number, updatePreferencesDto: UpdatePreferencesDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedProfile = await this.prismaService.profile.update({
      where: { userId },
      data: updatePreferencesDto,
    });

    return updatedProfile;
  }

  async getUserLimits(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Define limits based on account type
    const limits = {
      [AccountType.FREE]: {
        maxContainers: 5,
        maxConnections: 2,
        maxStorage: 10, // GB
        maxBandwidth: 100, // GB/month
      },
      [AccountType.MEDIUM]: {
        maxContainers: 20,
        maxConnections: 5,
        maxStorage: 50,
        maxBandwidth: 500,
      },
      [AccountType.PREMIUM]: {
        maxContainers: 100,
        maxConnections: 20,
        maxStorage: 200,
        maxBandwidth: 2000,
      },
    };

    const userLimits = limits[user.accountType];
    const usage = await this.getUserUsage(userId);

    return {
      limits: userLimits,
      usage,
      accountType: user.accountType,
    };
  }

  private async getUserUsage(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        connections: {
          include: {
            containers: true,
          },
        },
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      currentContainers: user.connections.reduce(
        (acc, conn) => acc + conn.containers.length,
        0,
      ),
      currentConnections: user.connections.length,
      storageUsed: user.profile?.diskUsage || 0,
      // Note: Bandwidth usage would typically come from a monitoring service
      bandwidthUsed: 0,
    };
  }

  async getResourceUsage(userId: number) {
    const usage = await this.getUserUsage(userId);
    const limits = await this.getUserLimits(userId);

    return {
      usage,
      limits: limits.limits,
      percentages: {
        containers: (usage.currentContainers / limits.limits.maxContainers) * 100,
        connections: (usage.currentConnections / limits.limits.maxConnections) * 100,
        storage: (usage.storageUsed / limits.limits.maxStorage) * 100,
        bandwidth: (usage.bandwidthUsed / limits.limits.maxBandwidth) * 100,
      },
    };
  }
}
