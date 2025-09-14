import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Tourist } from '../../entities/tourist.entity';
import { LocationHistory } from '../../entities/location-history.entity';
import { SafetyAlert, AlertType, AlertPriority } from '../../entities/safety-alert.entity';
import { UpdateLocationDto, UpdatePreferencesDto, UpdateSafetyScoreDto } from './dto/tourist.dto';
import { SafetyService } from '../safety/safety.service';
import { RedisService } from '../../config/redis.service';

@Injectable()
export class TouristService {
  constructor(
    @InjectRepository(Tourist)
    private touristRepository: Repository<Tourist>,
    @InjectRepository(LocationHistory)
    private locationHistoryRepository: Repository<LocationHistory>,
    @InjectRepository(SafetyAlert)
    private safetyAlertRepository: Repository<SafetyAlert>,
    private safetyService: SafetyService,
    private redisService: RedisService,
  ) {}

  async getProfile(touristId: string) {
    const tourist = await this.touristRepository.findOne({
      where: { id: touristId },
    });

    if (!tourist) {
      throw new NotFoundException('Tourist not found');
    }

    return this.sanitizeTourist(tourist);
  }

  async updateProfile(touristId: string, updateData: any) {
    const tourist = await this.touristRepository.findOne({
      where: { id: touristId },
    });

    if (!tourist) {
      throw new NotFoundException('Tourist not found');
    }

    Object.assign(tourist, updateData);
    const updatedTourist = await this.touristRepository.save(tourist);

    return this.sanitizeTourist(updatedTourist);
  }

  async updateLocation(touristId: string, locationDto: UpdateLocationDto) {
    const tourist = await this.touristRepository.findOne({
      where: { id: touristId },
    });

    if (!tourist) {
      throw new NotFoundException('Tourist not found');
    }

    // Update tourist's last known location
    tourist.lastKnownLatitude = locationDto.latitude;
    tourist.lastKnownLongitude = locationDto.longitude;
    tourist.lastLocationUpdate = new Date();

    await this.touristRepository.save(tourist);

    // Save location history
    const locationHistory = this.locationHistoryRepository.create({
      touristId,
      ...locationDto,
      timestamp: new Date(),
    });

    await this.locationHistoryRepository.save(locationHistory);

    // Check for geo-fence violations
    await this.safetyService.checkGeoFenceViolations(touristId, locationDto);

    // Update real-time location in Redis for dashboard
    await this.redisService.hSet(
      'tourist_locations',
      touristId,
      JSON.stringify({
        latitude: locationDto.latitude,
        longitude: locationDto.longitude,
        timestamp: new Date(),
        tourist: this.sanitizeTourist(tourist),
      }),
    );

    return { message: 'Location updated successfully' };
  }

  async getLocationHistory(touristId: string, limit = 50, offset = 0) {
    const [locations, total] = await this.locationHistoryRepository.findAndCount({
      where: { touristId },
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      locations,
      total,
      limit,
      offset,
    };
  }

  async updatePreferences(touristId: string, preferencesDto: UpdatePreferencesDto) {
    const tourist = await this.touristRepository.findOne({
      where: { id: touristId },
    });

    if (!tourist) {
      throw new NotFoundException('Tourist not found');
    }

    tourist.preferences = {
      ...tourist.preferences,
      ...preferencesDto,
    };

    const updatedTourist = await this.touristRepository.save(tourist);

    return this.sanitizeTourist(updatedTourist);
  }

  async updateSafetyScore(touristId: string, safetyScoreDto: UpdateSafetyScoreDto) {
    const tourist = await this.touristRepository.findOne({
      where: { id: touristId },
    });

    if (!tourist) {
      throw new NotFoundException('Tourist not found');
    }

    tourist.safetyScore = safetyScoreDto.safetyScore;

    const updatedTourist = await this.touristRepository.save(tourist);

    return this.sanitizeTourist(updatedTourist);
  }

  async activatePanic(touristId: string) {
    const tourist = await this.touristRepository.findOne({
      where: { id: touristId },
    });

    if (!tourist) {
      throw new NotFoundException('Tourist not found');
    }

    if (tourist.isPanicMode) {
      throw new BadRequestException('Panic mode is already active');
    }

    // Update panic status
    tourist.isPanicMode = true;
    tourist.panicActivatedAt = new Date();
    await this.touristRepository.save(tourist);

    // Create panic alert
    const panicAlert = this.safetyAlertRepository.create({
      touristId,
      alertType: AlertType.PANIC_BUTTON,
      priority: AlertPriority.CRITICAL,
      message: 'Panic button activated by tourist',
      description: 'Tourist has activated the panic button and requires immediate assistance',
      latitude: tourist.lastKnownLatitude,
      longitude: tourist.lastKnownLongitude,
      address: 'Location to be determined',
    });

    await this.safetyAlertRepository.save(panicAlert);

    // Notify emergency contacts and authorities
    await this.safetyService.handlePanicAlert(panicAlert);

    return { message: 'Panic alert activated successfully' };
  }

  async deactivatePanic(touristId: string) {
    const tourist = await this.touristRepository.findOne({
      where: { id: touristId },
    });

    if (!tourist) {
      throw new NotFoundException('Tourist not found');
    }

    if (!tourist.isPanicMode) {
      throw new BadRequestException('Panic mode is not active');
    }

    // Update panic status
    tourist.isPanicMode = false;
    await this.touristRepository.save(tourist);

    // Update any pending panic alerts
    await this.safetyAlertRepository.update(
      {
        touristId,
        alertType: AlertType.PANIC_BUTTON,
        status: 'pending',
      },
      {
        status: 'resolved',
        resolvedAt: new Date(),
        resolutionNotes: 'Panic mode deactivated by tourist',
      },
    );

    return { message: 'Panic alert deactivated successfully' };
  }

  async getSafetyAlerts(touristId: string, status?: string, limit = 20, offset = 0) {
    const whereCondition: any = { touristId };
    if (status) {
      whereCondition.status = status;
    }

    const [alerts, total] = await this.safetyAlertRepository.findAndCount({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      alerts,
      total,
      limit,
      offset,
    };
  }

  async getSafetyScore(touristId: string) {
    const tourist = await this.touristRepository.findOne({
      where: { id: touristId },
    });

    if (!tourist) {
      throw new NotFoundException('Tourist not found');
    }

    return {
      safetyScore: tourist.safetyScore,
      lastUpdated: tourist.updatedAt,
      factors: await this.calculateSafetyFactors(touristId),
    };
  }

  async getNearbyTourists(touristId: string, radius = 1000) {
    const tourist = await this.touristRepository.findOne({
      where: { id: touristId },
    });

    if (!tourist || !tourist.lastKnownLatitude || !tourist.lastKnownLongitude) {
      throw new BadRequestException('Tourist location not available');
    }

    // Get all active tourists
    const tourists = await this.touristRepository.find({
      where: {
        status: 'active',
        isTrackingEnabled: true,
      },
    });

    // Filter tourists within radius (simplified calculation)
    const nearbyTourists = tourists
      .filter(t => t.id !== touristId)
      .filter(t => {
        if (!t.lastKnownLatitude || !t.lastKnownLongitude) return false;
        
        const distance = this.calculateDistance(
          tourist.lastKnownLatitude,
          tourist.lastKnownLongitude,
          t.lastKnownLatitude,
          t.lastKnownLongitude,
        );
        
        return distance <= radius;
      })
      .map(t => ({
        id: t.id,
        firstName: t.firstName,
        lastName: t.lastName,
        safetyScore: t.safetyScore,
        lastLocationUpdate: t.lastLocationUpdate,
        distance: this.calculateDistance(
          tourist.lastKnownLatitude,
          tourist.lastKnownLongitude,
          t.lastKnownLatitude,
          t.lastKnownLongitude,
        ),
      }));

    return nearbyTourists;
  }

  private async calculateSafetyFactors(touristId: string) {
    const recentAlerts = await this.safetyAlertRepository.count({
      where: {
        touristId,
        createdAt: Between(
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          new Date(),
        ),
      },
    });

    const locationHistory = await this.locationHistoryRepository.count({
      where: {
        touristId,
        timestamp: Between(
          new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          new Date(),
        ),
      },
    });

    return {
      recentAlerts,
      locationUpdates24h: locationHistory,
      riskFactors: recentAlerts > 3 ? ['High alert frequency'] : [],
    };
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

  private sanitizeTourist(tourist: Tourist) {
    const { ...sanitized } = tourist;
    return sanitized;
  }
}
