import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Tourist, TouristStatus } from '../../entities/tourist.entity';
import { SafetyAlert, AlertType, AlertStatus } from '../../entities/safety-alert.entity';
import { LocationHistory } from '../../entities/location-history.entity';
import { GeoFence } from '../../entities/geo-fence.entity';
import { RedisService } from '../../config/redis.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Tourist)
    private touristRepository: Repository<Tourist>,
    @InjectRepository(SafetyAlert)
    private safetyAlertRepository: Repository<SafetyAlert>,
    @InjectRepository(LocationHistory)
    private locationHistoryRepository: Repository<LocationHistory>,
    @InjectRepository(GeoFence)
    private geoFenceRepository: Repository<GeoFence>,
    private redisService: RedisService,
  ) {}

  async getDashboardOverview() {
    const [
      totalTourists,
      activeTourists,
      missingTourists,
      totalAlerts,
      pendingAlerts,
      resolvedAlerts,
      totalGeoFences,
      activeGeoFences,
    ] = await Promise.all([
      this.touristRepository.count(),
      this.touristRepository.count({ where: { status: TouristStatus.ACTIVE } }),
      this.touristRepository.count({ where: { status: TouristStatus.MISSING } }),
      this.safetyAlertRepository.count(),
      this.safetyAlertRepository.count({ where: { status: AlertStatus.PENDING } }),
      this.safetyAlertRepository.count({ where: { status: AlertStatus.RESOLVED } }),
      this.geoFenceRepository.count(),
      this.geoFenceRepository.count({ where: { isActive: true } }),
    ]);

    return {
      tourists: {
        total: totalTourists,
        active: activeTourists,
        missing: missingTourists,
      },
      alerts: {
        total: totalAlerts,
        pending: pendingAlerts,
        resolved: resolvedAlerts,
        resolutionRate: totalAlerts > 0 ? (resolvedAlerts / totalAlerts) * 100 : 0,
      },
      geoFences: {
        total: totalGeoFences,
        active: activeGeoFences,
      },
    };
  }

  async getTouristLocations() {
    // Get real-time locations from Redis
    const locations = await this.redisService.hGetAll('tourist_locations');
    
    return Object.values(locations).map(location => {
      const parsed = JSON.parse(location as string);
      return {
        touristId: parsed.tourist.id,
        name: `${parsed.tourist.firstName} ${parsed.tourist.lastName}`,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        timestamp: parsed.timestamp,
        safetyScore: parsed.tourist.safetyScore,
        status: parsed.tourist.status,
      };
    });
  }

  async getAlertHeatmap(timeRange: string = '24h') {
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 1;
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

    const alerts = await this.safetyAlertRepository.find({
      where: {
        createdAt: Between(startDate, new Date()),
        latitude: Not(null),
        longitude: Not(null),
      },
    });

    // Group alerts by location for heatmap
    const heatmapData = alerts.reduce((acc, alert) => {
      if (alert.latitude && alert.longitude) {
        const key = `${alert.latitude.toFixed(4)},${alert.longitude.toFixed(4)}`;
        if (!acc[key]) {
          acc[key] = {
            latitude: alert.latitude,
            longitude: alert.longitude,
            count: 0,
            severity: 0,
            alertTypes: [],
          };
        }
        acc[key].count++;
        acc[key].severity += this.getSeverityScore(alert.priority);
        acc[key].alertTypes.push(alert.alertType);
      }
      return acc;
    }, {});

    return Object.values(heatmapData);
  }

  async getRecentAlerts(limit: number = 10) {
    const alerts = await this.safetyAlertRepository.find({
      relations: ['tourist'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return alerts.map(alert => ({
      id: alert.id,
      type: alert.alertType,
      priority: alert.priority,
      status: alert.status,
      message: alert.message,
      tourist: {
        id: alert.tourist.id,
        name: `${alert.tourist.firstName} ${alert.tourist.lastName}`,
        digitalId: alert.tourist.digitalId,
      },
      location: {
        latitude: alert.latitude,
        longitude: alert.longitude,
        address: alert.address,
      },
      createdAt: alert.createdAt,
    }));
  }

  async getTouristClusters(radius: number = 1000) {
    const activeTourists = await this.touristRepository.find({
      where: {
        status: TouristStatus.ACTIVE,
        isTrackingEnabled: true,
        lastKnownLatitude: Not(null),
        lastKnownLongitude: Not(null),
      },
    });

    const clusters = [];
    const processed = new Set();

    for (const tourist of activeTourists) {
      if (processed.has(tourist.id)) continue;

      const cluster = {
        center: {
          latitude: tourist.lastKnownLatitude,
          longitude: tourist.lastKnownLongitude,
        },
        tourists: [tourist],
        count: 1,
      };

      // Find nearby tourists
      for (const otherTourist of activeTourists) {
        if (otherTourist.id === tourist.id || processed.has(otherTourist.id)) continue;

        const distance = this.calculateDistance(
          tourist.lastKnownLatitude,
          tourist.lastKnownLongitude,
          otherTourist.lastKnownLatitude,
          otherTourist.lastKnownLongitude,
        );

        if (distance <= radius) {
          cluster.tourists.push(otherTourist);
          cluster.count++;
          processed.add(otherTourist.id);
        }
      }

      if (cluster.count > 1) {
        clusters.push(cluster);
        processed.add(tourist.id);
      }
    }

    return clusters;
  }

  async getStatistics(timeRange: string = '24h') {
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : timeRange === '30d' ? 720 : 1;
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

    const [
      alertsByType,
      alertsByPriority,
      alertsByStatus,
      locationUpdates,
      panicAlerts,
      geoFenceViolations,
    ] = await Promise.all([
      this.getAlertsByType(startDate),
      this.getAlertsByPriority(startDate),
      this.getAlertsByStatus(startDate),
      this.locationHistoryRepository.count({
        where: { timestamp: Between(startDate, new Date()) },
      }),
      this.safetyAlertRepository.count({
        where: {
          alertType: AlertType.PANIC_BUTTON,
          createdAt: Between(startDate, new Date()),
        },
      }),
      this.safetyAlertRepository.count({
        where: {
          alertType: AlertType.GEO_FENCE_VIOLATION,
          createdAt: Between(startDate, new Date()),
        },
      }),
    ]);

    return {
      timeRange,
      alertsByType,
      alertsByPriority,
      alertsByStatus,
      locationUpdates,
      panicAlerts,
      geoFenceViolations,
    };
  }

  async getGeoFenceStatus() {
    const geoFences = await this.geoFenceRepository.find({
      where: { isActive: true },
    });

    const geoFenceStatus = await Promise.all(
      geoFences.map(async (fence) => {
        const violations = await this.safetyAlertRepository.count({
          where: {
            alertType: AlertType.GEO_FENCE_VIOLATION,
            metadata: { geoFenceId: fence.id },
            createdAt: Between(
              new Date(Date.now() - 24 * 60 * 60 * 1000),
              new Date(),
            ),
          },
        });

        return {
          id: fence.id,
          name: fence.name,
          type: fence.type,
          violations24h: violations,
          status: violations > 5 ? 'high_risk' : violations > 0 ? 'medium_risk' : 'safe',
        };
      }),
    );

    return geoFenceStatus;
  }

  private async getAlertsByType(startDate: Date) {
    const alerts = await this.safetyAlertRepository
      .createQueryBuilder('alert')
      .select('alert.alertType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('alert.createdAt >= :startDate', { startDate })
      .groupBy('alert.alertType')
      .getRawMany();

    return alerts.reduce((acc, alert) => {
      acc[alert.type] = parseInt(alert.count);
      return acc;
    }, {});
  }

  private async getAlertsByPriority(startDate: Date) {
    const alerts = await this.safetyAlertRepository
      .createQueryBuilder('alert')
      .select('alert.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .where('alert.createdAt >= :startDate', { startDate })
      .groupBy('alert.priority')
      .getRawMany();

    return alerts.reduce((acc, alert) => {
      acc[alert.priority] = parseInt(alert.count);
      return acc;
    }, {});
  }

  private async getAlertsByStatus(startDate: Date) {
    const alerts = await this.safetyAlertRepository
      .createQueryBuilder('alert')
      .select('alert.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('alert.createdAt >= :startDate', { startDate })
      .groupBy('alert.status')
      .getRawMany();

    return alerts.reduce((acc, alert) => {
      acc[alert.status] = parseInt(alert.count);
      return acc;
    }, {});
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  private getSeverityScore(priority: string): number {
    switch (priority) {
      case 'low': return 1;
      case 'medium': return 2;
      case 'high': return 3;
      case 'critical': return 4;
      default: return 1;
    }
  }
}
