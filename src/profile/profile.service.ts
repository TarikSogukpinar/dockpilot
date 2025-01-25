import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/database.service';
import { HashingService } from 'src/utils/hashing/hashing.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateEmailDto } from './dto/update-email.dto';

@Injectable()
export class ProfileService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly hashingService: HashingService,
    ) { }

    async getProfile(userId: number) {
        const userWithProfile = await this.prismaService.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
            },
            select: {
                id: true,
                uuid: true,
                email: true,
                name: true,
                role: true,
                accountType: true,
                createdAt: true,
                updatedAt: true,
                profile: {
                    select: {
                        company: true,
                        phone: true,
                        address: true,
                        avatarUrl: true,
                        bio: true,
                        website: true,
                        github: true,
                        twitter: true,
                        linkedin: true,
                    },
                },
            },
        });

        if (!userWithProfile) {
            throw new NotFoundException('User not found');
        }

        return userWithProfile;
    }

    async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Update or create profile
        const updatedProfile = await this.prismaService.profile.upsert({
            where: {
                userId: userId,
            },
            create: {
                ...updateProfileDto,
                userId: userId,
            },
            update: updateProfileDto,
        });

        return {
            ...user,
            profile: updatedProfile,
        };
    }

    async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await this.hashingService.comparePassword(
            changePasswordDto.currentPassword,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        const hashedPassword = await this.hashingService.hashPassword(
            changePasswordDto.newPassword,
        );

        await this.prismaService.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return { message: 'Password changed successfully' };
    }

    async updateEmail(userId: number, updateEmailDto: UpdateEmailDto) {
        const existingUser = await this.prismaService.user.findUnique({
            where: { email: updateEmailDto.email },
        });

        if (existingUser && existingUser.id !== userId) {
            throw new UnauthorizedException('Email already in use');
        }

        const user = await this.prismaService.user.update({
            where: { id: userId },
            data: { email: updateEmailDto.email },
            select: {
                id: true,
                email: true,
            },
        });

        return user;
    }

    async updateAvatar(userId: number, avatarUrl: string) {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const updatedProfile = await this.prismaService.profile.upsert({
            where: {
                userId: userId,
            },
            create: {
                avatarUrl,
                userId: userId,
            },
            update: {
                avatarUrl,
            },
        });

        return {
            id: user.id,
            profile: {
                avatarUrl: updatedProfile.avatarUrl,
            },
        };
    }
} 