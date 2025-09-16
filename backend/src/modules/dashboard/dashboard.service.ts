import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not } from 'typeorm';
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

  async getDashboardStats() {
    const [
      totalTourists,
      activeTourists,
      totalAlerts,
      pendingAlerts,
      resolvedAlerts,
      criticalAlerts,
    ] = await Promise.all([
      this.touristRepository.count(),
      this.touristRepository.count({ where: { status: TouristStatus.ACTIVE } }),
      this.safetyAlertRepository.count(),
      this.safetyAlertRepository.count({ where: { status: AlertStatus.PENDING } }),
      this.safetyAlertRepository.count({ where: { status: AlertStatus.RESOLVED } }),
      this.safetyAlertRepository.count({ where: { priority: 'critical' } }),
    ]);

    return {
      totalTourists,
      activeTourists,
      totalAlerts,
      pendingAlerts,
      resolvedAlerts,
      criticalAlerts,
    };
  }

  async getRecentAlerts(limit: number = 10) {
    return this.safetyAlertRepository.find({
      relations: ['tourist'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getTouristDistribution() {
    const tourists = await this.touristRepository.find({
      where: {
        lastKnownLatitude: Not(null),
        lastKnownLongitude: Not(null),
      },
      select: ['id', 'lastKnownLatitude', 'lastKnownLongitude', 'safetyScore'],
    });

    return tourists.map(tourist => ({
      id: tourist.id,
      latitude: tourist.lastKnownLatitude,
      longitude: tourist.lastKnownLongitude,
      safetyScore: tourist.safetyScore,
    }));
  }

  async getSafetyScoreDistribution() {
    const scores = await this.touristRepository
      .createQueryBuilder('tourist')
      .select('tourist.safetyScore', 'score')
      .addSelect('COUNT(*)', 'count')
      .groupBy('tourist.safetyScore')
      .getRawMany();

    return scores.map(score => ({
      score: score.score,
      count: parseInt(score.count),
    }));
  }

  async getAlertTrends(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const alerts = await this.safetyAlertRepository
      .createQueryBuilder('alert')
      .select('DATE(alert.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('alert.createdAt >= :startDate', { startDate })
      .groupBy('DATE(alert.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return alerts.map(alert => ({
      date: alert.date,
      count: parseInt(alert.count),
    }));
  }

  async getHighRiskZones() {
    const tourists = await this.touristRepository.find({
      where: {
        lastKnownLatitude: Not(null),
        lastKnownLongitude: Not(null),
      },
      select: ['id', 'lastKnownLatitude', 'lastKnownLongitude', 'safetyScore'],
    });

    // Group tourists by location clusters
    const clusters = this.clusterTourists(tourists);
    
    return clusters.map(cluster => ({
      center: cluster.center,
      count: cluster.tourists.length,
      averageRisk: cluster.averageRisk,
    }));
  }

  private clusterTourists(tourists: any[], radius: number = 0.01) {
    const clusters = [];
    const processed = new Set();

    for (const tourist of tourists) {
      if (processed.has(tourist.id)) continue;

      const cluster = {
        center: {
          latitude: tourist.lastKnownLatitude,
          longitude: tourist.lastKnownLongitude,
        },
        tourists: [tourist],
        averageRisk: this.getRiskScore(tourist.safetyScore),
      };

      // Find nearby tourists
      for (const other of tourists) {
        if (processed.has(other.id) || other.id === tourist.id) continue;

        const distance = this.calculateDistance(
          tourist.lastKnownLatitude,
          tourist.lastKnownLongitude,
          other.lastKnownLatitude,
          other.lastKnownLongitude,
        );

        if (distance <= radius) {
          cluster.tourists.push(other);
          processed.add(other.id);
        }
      }

      processed.add(tourist.id);
      clusters.push(cluster);
    }

    return clusters;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private getRiskScore(safetyScore: string): number {
    switch (safetyScore) {
      case 'low': return 1;
      case 'medium': return 2;
      case 'high': return 3;
      case 'critical': return 4;
      default: return 2;
    }
  }

  async getTouristClusters(radius: number = 0.01) {
    const tourists = await this.touristRepository.find({
      where: {
        status: TouristStatus.ACTIVE,
        isTrackingEnabled: true,
        lastKnownLatitude: Not(null),
        lastKnownLongitude: Not(null),
      },
    });

    // Filter tourists within radius (simplified calculation)
    const clusters = this.clusterTourists(tourists, radius);
    
    return clusters.filter(cluster => cluster.tourists.length > 1);
  }
}
