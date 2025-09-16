import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Tourist, TouristStatus } from '../../entities/tourist.entity';
import { LocationHistory } from '../../entities/location-history.entity';
import { SafetyAlert, AlertType, AlertPriority, AlertStatus } from '../../entities/safety-alert.entity';
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

  async createTourist(touristData: Partial<Tourist>): Promise<Tourist> {
    const tourist = this.touristRepository.create(touristData);
    return this.touristRepository.save(tourist);
  }

  async findById(id: string): Promise<Tourist> {
    const tourist = await this.touristRepository.findOne({ where: { id } });
    if (!tourist) {
      throw new NotFoundException('Tourist not found');
    }
    return tourist;
  }

  async findByDigitalId(digitalId: string): Promise<Tourist> {
    const tourist = await this.touristRepository.findOne({ where: { digitalId } });
    if (!tourist) {
      throw new NotFoundException('Tourist not found');
    }
    return tourist;
  }

  async updateLocation(touristId: string, locationDto: UpdateLocationDto): Promise<Tourist> {
    const tourist = await this.findById(touristId);

    // Update tourist's last known location
    tourist.lastKnownLatitude = locationDto.latitude;
    tourist.lastKnownLongitude = locationDto.longitude;
    tourist.lastLocationUpdate = new Date();

    // Save location history
    const locationHistory = this.locationHistoryRepository.create({
      touristId,
      latitude: locationDto.latitude,
      longitude: locationDto.longitude,
      timestamp: new Date(),
      accuracy: locationDto.accuracy,
    });
    await this.locationHistoryRepository.save(locationHistory);

    // Check for geo-fence violations
    await this.safetyService.checkGeoFenceViolations(touristId, locationDto);

    // Cache location in Redis for real-time access
    await this.redisService.set(
      `tourist:${touristId}:location`,
      JSON.stringify({
        latitude: locationDto.latitude,
        longitude: locationDto.longitude,
        timestamp: new Date(),
      }),
      300, // 5 minutes TTL
    );

    return this.touristRepository.save(tourist);
  }

  async updatePreferences(touristId: string, preferencesDto: UpdatePreferencesDto): Promise<Tourist> {
    const tourist = await this.findById(touristId);
    tourist.preferences = { ...tourist.preferences, ...preferencesDto };
    return this.touristRepository.save(tourist);
  }

  async updateSafetyScore(touristId: string, safetyScoreDto: UpdateSafetyScoreDto): Promise<Tourist> {
    const tourist = await this.findById(touristId);
    tourist.safetyScore = safetyScoreDto.safetyScore;
    return this.touristRepository.save(tourist);
  }

  async activatePanicMode(touristId: string): Promise<Tourist> {
    const tourist = await this.findById(touristId);
    
    if (tourist.isPanicMode) {
      throw new BadRequestException('Panic mode is already active');
    }

    tourist.isPanicMode = true;
    tourist.panicActivatedAt = new Date();
    tourist.status = TouristStatus.EMERGENCY;

    // Create emergency alert
    const alert = this.safetyAlertRepository.create({
      touristId,
      alertType: AlertType.PANIC_BUTTON,
      priority: AlertPriority.CRITICAL,
      status: AlertStatus.PENDING,
      description: 'Panic button activated by tourist',
      location: {
        latitude: tourist.lastKnownLatitude,
        longitude: tourist.lastKnownLongitude,
      },
    });
    await this.safetyAlertRepository.save(alert);

    // Notify emergency services
    await this.safetyService.notifyEmergencyServices(touristId, alert);

    return this.touristRepository.save(tourist);
  }

  async deactivatePanicMode(touristId: string): Promise<Tourist> {
    const tourist = await this.findById(touristId);
    
    if (!tourist.isPanicMode) {
      throw new BadRequestException('Panic mode is not active');
    }

    tourist.isPanicMode = false;
    tourist.status = TouristStatus.ACTIVE;

    // Update any pending panic alerts
    await this.safetyAlertRepository.update(
      {
        touristId,
        alertType: AlertType.PANIC_BUTTON,
        status: AlertStatus.PENDING,
      },
      {
        status: AlertStatus.RESOLVED,
        resolvedAt: new Date(),
        resolutionNotes: 'Panic mode deactivated by tourist',
      },
    );

    return this.touristRepository.save(tourist);
  }

  async getLocationHistory(touristId: string, limit: number = 100): Promise<LocationHistory[]> {
    return this.locationHistoryRepository.find({
      where: { touristId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getNearbyTourists(touristId: string, radius: number = 1): Promise<Tourist[]> {
    const tourist = await this.findById(touristId);
    
    if (!tourist.lastKnownLatitude || !tourist.lastKnownLongitude) {
      return [];
    }

    // Get all active tourists
    const tourists = await this.touristRepository.find({
      where: {
        status: TouristStatus.ACTIVE,
        isTrackingEnabled: true,
      },
    });

    // Filter tourists within radius (simplified calculation)
    const nearbyTourists = tourists.filter(t => {
      if (t.id === touristId || !t.lastKnownLatitude || !t.lastKnownLongitude) {
        return false;
      }

      const distance = this.calculateDistance(
        tourist.lastKnownLatitude,
        tourist.lastKnownLongitude,
        t.lastKnownLatitude,
        t.lastKnownLongitude,
      );

      return distance <= radius;
    });

    return nearbyTourists;
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

  async getAllTourists(): Promise<Tourist[]> {
    return this.touristRepository.find({
      relations: ['safetyAlerts', 'locationHistory'],
    });
  }

  async getTouristsByStatus(status: TouristStatus): Promise<Tourist[]> {
    return this.touristRepository.find({
      where: { status },
      relations: ['safetyAlerts'],
    });
  }

  async deleteTourist(id: string): Promise<void> {
    const tourist = await this.findById(id);
    await this.touristRepository.remove(tourist);
  }
}
