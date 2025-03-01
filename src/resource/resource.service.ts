import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/database.service';
import { ConnectionService } from '../connection/connection.service';
import { ResourceMetricType, AlertSeverity } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ResourceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly connectionService: ConnectionService,
  ) {}

  // Metrics Collection
  @Cron(CronExpression.EVERY_30_SECONDS)
  async collectMetrics() {
    const containers = await this.prisma.container.findMany({
      where: { status: 'RUNNING' },
      include: { connection: true },
    });

    for (const container of containers) {
      try {
        const stats = await this.getContainerStats(container);
        await this.saveMetrics(container.id, stats);
        await this.checkAlerts(container.id, stats);
        await this.generateOptimizationSuggestions(container.id, stats);
      } catch (error) {
        console.error(
          `Failed to collect metrics for container ${container.name}:`,
          error,
        );
      }
    }
  }

  private async getContainerStats(container: any) {
    // Implement Docker stats collection using Dockerode
    // Return CPU, Memory, Disk, Network metrics
  }

  private async saveMetrics(containerId: number, stats: any) {
    const metrics = [
      { type: 'CPU', value: stats.cpuUsage, unit: '%' },
      { type: 'MEMORY', value: stats.memoryUsage, unit: 'MB' },
      { type: 'DISK_READ', value: stats.diskRead, unit: 'MB' },
      { type: 'DISK_WRITE', value: stats.diskWrite, unit: 'MB' },
      { type: 'NETWORK_IN', value: stats.networkIn, unit: 'MB' },
      { type: 'NETWORK_OUT', value: stats.networkOut, unit: 'MB' },
      { type: 'PIDS', value: stats.pids, unit: 'count' },
    ];

    await this.prisma.resourceMetric.createMany({
      data: metrics.map((metric) => ({
        containerId,
        type: metric.type as ResourceMetricType,
        value: metric.value,
        unit: metric.unit,
      })),
    });
  }

  // Resource Limits Management
  async setResourceLimit(
    containerUuid: string,
    type: ResourceMetricType,
    limits: any,
  ) {
    const container = await this.prisma.container.findUnique({
      where: { uuid: containerUuid },
    });

    if (!container) {
      throw new NotFoundException('Container not found');
    }

    return this.prisma.resourceLimit.upsert({
      where: {
        containerId_type: {
          containerId: container.id,
          type,
        },
      },
      update: limits,
      create: {
        ...limits,
        containerId: container.id,
        type,
      },
    });
  }

  // Alerts Management
  private async checkAlerts(containerId: number, stats: any) {
    const limits = await this.prisma.resourceLimit.findMany({
      where: { containerId, enabled: true },
    });

    for (const limit of limits) {
      const currentValue = stats[limit.type.toLowerCase()];

      if (currentValue > limit.hardLimit) {
        await this.createAlert(
          containerId,
          limit.type,
          currentValue,
          limit.hardLimit,
          'CRITICAL',
        );
      } else if (currentValue > limit.softLimit) {
        await this.createAlert(
          containerId,
          limit.type,
          currentValue,
          limit.softLimit,
          'WARNING',
        );
      }
    }
  }

  private async createAlert(
    containerId: number,
    type: ResourceMetricType,
    value: number,
    threshold: number,
    severity: AlertSeverity,
  ) {
    await this.prisma.resourceAlert.create({
      data: {
        containerId,
        type,
        value,
        threshold,
        severity,
        message: `${type} usage (${value}) exceeded ${severity.toLowerCase()} threshold (${threshold})`,
      },
    });
  }

  // Optimization Suggestions
  private async generateOptimizationSuggestions(
    containerId: number,
    stats: any,
  ) {
    const metrics = await this.getHistoricalMetrics(containerId);
    const suggestions = this.analyzeMetrics(metrics, stats);

    for (const suggestion of suggestions) {
      await this.prisma.resourceOptimization.create({
        data: {
          containerId,
          ...suggestion,
        },
      });
    }
  }

  private async getHistoricalMetrics(containerId: number) {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return this.prisma.resourceMetric.findMany({
      where: {
        containerId,
        timestamp: { gte: oneWeekAgo },
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  private analyzeMetrics(historicalMetrics: any[], currentStats: any) {
    const suggestions = [];

    // CPU Optimization
    if (this.isResourceUnderutilized(historicalMetrics, 'CPU', 20)) {
      suggestions.push({
        metric: 'CPU',
        suggestion: 'Consider reducing CPU limit',
        impact: 'MEDIUM',
        currentValue: currentStats.cpuLimit,
        suggestedValue: currentStats.cpuLimit * 0.7,
      });
    }

    // Memory Optimization
    if (this.isResourceOverutilized(historicalMetrics, 'MEMORY', 90)) {
      suggestions.push({
        metric: 'MEMORY',
        suggestion: 'Consider increasing memory limit',
        impact: 'HIGH',
        currentValue: currentStats.memoryLimit,
        suggestedValue: currentStats.memoryLimit * 1.3,
      });
    }

    return suggestions;
  }

  private isResourceUnderutilized(
    metrics: any[],
    type: string,
    threshold: number,
  ) {
    const relevantMetrics = metrics.filter((m) => m.type === type);
    const avgUsage = this.calculateAverage(relevantMetrics.map((m) => m.value));
    return avgUsage < threshold;
  }

  private isResourceOverutilized(
    metrics: any[],
    type: string,
    threshold: number,
  ) {
    const relevantMetrics = metrics.filter((m) => m.type === type);
    const avgUsage = this.calculateAverage(relevantMetrics.map((m) => m.value));
    return avgUsage > threshold;
  }

  private calculateAverage(values: number[]) {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  // Query Methods
  async getContainerMetrics(
    containerUuid: string,
    type: ResourceMetricType,
    timeRange: { start: Date; end: Date },
  ) {
    const container = await this.prisma.container.findUnique({
      where: { uuid: containerUuid },
    });

    if (!container) {
      throw new NotFoundException('Container not found');
    }

    return this.prisma.resourceMetric.findMany({
      where: {
        containerId: container.id,
        type,
        timestamp: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
      orderBy: { timestamp: 'asc' },
    });
  }

  async getContainerAlerts(containerUuid: string, resolved?: boolean) {
    const container = await this.prisma.container.findUnique({
      where: { uuid: containerUuid },
    });

    if (!container) {
      throw new NotFoundException('Container not found');
    }

    return this.prisma.resourceAlert.findMany({
      where: {
        containerId: container.id,
        ...(resolved !== undefined && { resolved }),
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getOptimizationSuggestions(
    containerUuid: string,
    implemented?: boolean,
  ) {
    const container = await this.prisma.container.findUnique({
      where: { uuid: containerUuid },
    });

    if (!container) {
      throw new NotFoundException('Container not found');
    }

    return this.prisma.resourceOptimization.findMany({
      where: {
        containerId: container.id,
        ...(implemented !== undefined && { implemented }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async implementOptimizationSuggestion(suggestionId: string) {
    const suggestion = await this.prisma.resourceOptimization.findUnique({
      where: { uuid: suggestionId },
      include: { container: true },
    });

    if (!suggestion) {
      throw new NotFoundException('Optimization suggestion not found');
    }

    // Implement the suggestion using Docker API
    // Update container resources based on suggestion

    return this.prisma.resourceOptimization.update({
      where: { uuid: suggestionId },
      data: {
        implemented: true,
        implementedAt: new Date(),
      },
    });
  }
}
