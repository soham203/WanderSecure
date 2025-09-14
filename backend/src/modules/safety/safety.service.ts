import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { SafetyAlert, AlertType, AlertStatus, AlertPriority } from '../../entities/safety-alert.entity';
import { GeoFence, GeoFenceType } from '../../entities/geo-fence.entity';
import { Tourist, TouristStatus } from '../../entities/tourist.entity';
import { LocationHistory } from '../../entities/location-history.entity';
import { CreateGeoFenceDto, UpdateAlertStatusDto } from './dto/safety.dto';
import { NotificationService } from '../notification/notification.service';
import { RedisService } from '../../config/redis.service';

@Injectable()
export class SafetyService {
  constructor(
    @InjectRepository(SafetyAlert)
    private safetyAlertRepository: Repository<SafetyAlert>,
    @InjectRepository(GeoFence)
    private geoFenceRepository: Repository<GeoFence>,
    @InjectRepository(Tourist)
    private touristRepository: Repository<Tourist>,
    @InjectRepository(LocationHistory)
    private locationHistoryRepository: Repository<LocationHistory>,
    private notificationService: NotificationService,
    private redisService: RedisService,
  ) {}

  async getAlerts(status?: string, priority?: string, limit = 20, offset = 0) {
    const whereCondition: any = {};
    if (status) whereCondition.status = status;
    if (priority) whereCondition.priority = priority;

    const [alerts, total] = await this.safetyAlertRepository.findAndCount({
      where: whereCondition,
      relations: ['tourist'],
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

  async getAlert(id: string) {
    const alert = await this.safetyAlertRepository.findOne({
      where: { id },
      relations: ['tourist'],
    });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    return alert;
  }

  async updateAlertStatus(id: string, updateStatusDto: UpdateAlertStatusDto) {
    const alert = await this.safetyAlertRepository.findOne({
      where: { id },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    alert.status = updateStatusDto.status;
    if (updateStatusDto.status === AlertStatus.ACKNOWLEDGED) {
      alert.acknowledgedAt = new Date();
    }
    if (updateStatusDto.status === AlertStatus.RESOLVED) {
      alert.resolvedAt = new Date();
      alert.resolutionNotes = updateStatusDto.notes;
    }

    const updatedAlert = await this.safetyAlertRepository.save(alert);

    // Notify relevant parties about status change
    await this.notificationService.notifyAlertStatusChange(updatedAlert);

    return updatedAlert;
  }

  async getGeoFences(type?: string, isActive?: boolean) {
    const whereCondition: any = {};
    if (type) whereCondition.type = type;
    if (isActive !== undefined) whereCondition.isActive = isActive;

    return this.geoFenceRepository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
    });
  }

  async createGeoFence(createGeoFenceDto: CreateGeoFenceDto) {
    const geoFence = this.geoFenceRepository.create(createGeoFenceDto);
    return this.geoFenceRepository.save(geoFence);
  }

  async getGeoFence(id: string) {
    const geoFence = await this.geoFenceRepository.findOne({
      where: { id },
    });

    if (!geoFence) {
      throw new NotFoundException('Geo-fence not found');
    }

    return geoFence;
  }

  async checkGeoFenceViolations(touristId: string, location: any) {
    const activeGeoFences = await this.geoFenceRepository.find({
      where: { isActive: true },
    });

    for (const fence of activeGeoFences) {
      const isInside = this.isPointInsideGeoFence(
        location.latitude,
        location.longitude,
        fence,
      );

      if (!isInside && fence.type === GeoFenceType.RESTRICTED) {
        // Create geo-fence violation alert
        const alert = this.safetyAlertRepository.create({
          touristId,
          alertType: AlertType.GEO_FENCE_VIOLATION,
          priority: AlertPriority.HIGH,
          message: `Tourist entered restricted area: ${fence.name}`,
          description: `Tourist has entered the restricted geo-fence zone: ${fence.name}`,
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
          metadata: {
            geoFenceId: fence.id,
            geoFenceName: fence.name,
            violationType: 'restricted_area',
          },
        });

        await this.safetyAlertRepository.save(alert);
        await this.notificationService.notifyGeoFenceViolation(alert, fence);
      }
    }
  }

  async handlePanicAlert(alert: SafetyAlert) {
    // Notify emergency contacts
    const tourist = await this.touristRepository.findOne({
      where: { id: alert.touristId },
    });

    if (tourist) {
      for (const contact of tourist.emergencyContacts) {
        await this.notificationService.sendSMS(
          contact.phone,
          `URGENT: ${tourist.firstName} ${tourist.lastName} has activated panic button. Location: ${alert.address || 'Unknown'}. Please contact authorities immediately.`,
        );
      }
    }

    // Notify police/authorities
    await this.notificationService.notifyEmergencyServices(alert);

    // Update response actions
    alert.responseActions = {
      policeNotified: true,
      emergencyContactsNotified: true,
      efirGenerated: false,
      responseTime: 0,
    };

    await this.safetyAlertRepository.save(alert);
  }

  async getHeatmapData(region?: string, timeRange?: string) {
    const timeRangeDays = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 1;
    const startDate = new Date(Date.now() - timeRangeDays * 24 * 60 * 60 * 1000);

    const alerts = await this.safetyAlertRepository.find({
      where: {
        createdAt: Between(startDate, new Date()),
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
          };
        }
        acc[key].count++;
        acc[key].severity += this.getSeverityScore(alert.priority);
      }
      return acc;
    }, {});

    return Object.values(heatmapData);
  }

  async getStatistics(period?: string) {
    const timeRangeDays = period === 'week' ? 7 : period === 'month' ? 30 : 1;
    const startDate = new Date(Date.now() - timeRangeDays * 24 * 60 * 60 * 1000);

    const [
      totalAlerts,
      panicAlerts,
      geoFenceViolations,
      resolvedAlerts,
      activeTourists,
      missingTourists,
    ] = await Promise.all([
      this.safetyAlertRepository.count({
        where: { createdAt: Between(startDate, new Date()) },
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
      this.safetyAlertRepository.count({
        where: {
          status: AlertStatus.RESOLVED,
          createdAt: Between(startDate, new Date()),
        },
      }),
      this.touristRepository.count({
        where: { status: TouristStatus.ACTIVE },
      }),
      this.touristRepository.count({
        where: { status: TouristStatus.MISSING },
      }),
    ]);

    return {
      totalAlerts,
      panicAlerts,
      geoFenceViolations,
      resolvedAlerts,
      activeTourists,
      missingTourists,
      resolutionRate: totalAlerts > 0 ? (resolvedAlerts / totalAlerts) * 100 : 0,
      period: `${timeRangeDays} days`,
    };
  }

  async triggerAnomalyDetection() {
    const activeTourists = await this.touristRepository.find({
      where: { status: TouristStatus.ACTIVE, isTrackingEnabled: true },
    });

    const anomalies = [];

    for (const tourist of activeTourists) {
      // Check for prolonged inactivity (no location update in 2 hours)
      if (tourist.lastLocationUpdate) {
        const hoursSinceLastUpdate = (Date.now() - tourist.lastLocationUpdate.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastUpdate > 2) {
          const alert = this.safetyAlertRepository.create({
            touristId: tourist.id,
            alertType: AlertType.PROLONGED_INACTIVITY,
            priority: AlertPriority.MEDIUM,
            message: `Tourist inactive for ${Math.round(hoursSinceLastUpdate)} hours`,
            description: `No location updates received from ${tourist.firstName} ${tourist.lastName} for ${Math.round(hoursSinceLastUpdate)} hours`,
            latitude: tourist.lastKnownLatitude,
            longitude: tourist.lastKnownLongitude,
          });

          await this.safetyAlertRepository.save(alert);
          anomalies.push(alert);
        }
      }

      // Check for sudden location drop-off
      const recentLocations = await this.locationHistoryRepository.find({
        where: {
          touristId: tourist.id,
          timestamp: Between(
            new Date(Date.now() - 24 * 60 * 60 * 1000),
            new Date(),
          ),
        },
        order: { timestamp: 'DESC' },
        take: 10,
      });

      if (recentLocations.length > 0) {
        const lastLocation = recentLocations[0];
        const hoursSinceLastLocation = (Date.now() - lastLocation.timestamp.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastLocation > 4) {
          const alert = this.safetyAlertRepository.create({
            touristId: tourist.id,
            alertType: AlertType.LOCATION_DROPOFF,
            priority: AlertPriority.HIGH,
            message: `Sudden location drop-off detected`,
            description: `No location updates from ${tourist.firstName} ${tourist.lastName} for ${Math.round(hoursSinceLastLocation)} hours`,
            latitude: lastLocation.latitude,
            longitude: lastLocation.longitude,
          });

          await this.safetyAlertRepository.save(alert);
          anomalies.push(alert);
        }
      }
    }

    return {
      message: 'Anomaly detection completed',
      anomaliesDetected: anomalies.length,
      anomalies,
    };
  }

  async getMissingTourists() {
    const missingTourists = await this.touristRepository.find({
      where: { status: TouristStatus.MISSING },
      relations: ['safetyAlerts'],
    });

    return missingTourists.map(tourist => ({
      id: tourist.id,
      name: `${tourist.firstName} ${tourist.lastName}`,
      digitalId: tourist.digitalId,
      lastKnownLocation: {
        latitude: tourist.lastKnownLatitude,
        longitude: tourist.lastKnownLongitude,
        address: 'Unknown',
        timestamp: tourist.lastLocationUpdate,
      },
      missingSince: tourist.updatedAt,
      alerts: tourist.safetyAlerts.filter(alert => 
        alert.alertType === AlertType.MISSING_PERSON
      ),
    }));
  }

  async generateEFIR(touristId: string) {
    const tourist = await this.touristRepository.findOne({
      where: { id: touristId },
    });

    if (!tourist) {
      throw new NotFoundException('Tourist not found');
    }

    // Generate E-FIR data
    const efirData = {
      firNumber: `EFIR-${Date.now()}`,
      touristId: tourist.id,
      touristName: `${tourist.firstName} ${tourist.lastName}`,
      digitalId: tourist.digitalId,
      phoneNumber: tourist.phoneNumber,
      lastKnownLocation: {
        latitude: tourist.lastKnownLatitude,
        longitude: tourist.lastKnownLongitude,
        timestamp: tourist.lastLocationUpdate,
      },
      emergencyContacts: tourist.emergencyContacts,
      generatedAt: new Date(),
      status: 'pending',
    };

    // Store E-FIR in database (in real implementation, this would be sent to police system)
    await this.redisService.set(
      `efir:${efirData.firNumber}`,
      JSON.stringify(efirData),
      30 * 24 * 60 * 60, // 30 days
    );

    // Update tourist status
    tourist.status = TouristStatus.MISSING;
    await this.touristRepository.save(tourist);

    // Create missing person alert
    const alert = this.safetyAlertRepository.create({
      touristId,
      alertType: AlertType.MISSING_PERSON,
      priority: AlertPriority.CRITICAL,
      message: `Missing person report generated: ${tourist.firstName} ${tourist.lastName}`,
      description: `E-FIR ${efirData.firNumber} has been generated for missing tourist`,
      latitude: tourist.lastKnownLatitude,
      longitude: tourist.lastKnownLongitude,
      responseActions: {
        policeNotified: true,
        emergencyContactsNotified: true,
        efirGenerated: true,
        responseTime: 0,
      },
    });

    await this.safetyAlertRepository.save(alert);

    return efirData;
  }

  private isPointInsideGeoFence(latitude: number, longitude: number, geoFence: GeoFence): boolean {
    const { coordinates, shape } = geoFence;

    switch (shape) {
      case 'circle':
        if (!coordinates.center || !coordinates.radius) return false;
        const distance = this.calculateDistance(
          latitude,
          longitude,
          coordinates.center.latitude,
          coordinates.center.longitude,
        );
        return distance <= coordinates.radius;

      case 'polygon':
        if (!coordinates.points || coordinates.points.length < 3) return false;
        return this.isPointInPolygon(latitude, longitude, coordinates.points);

      case 'rectangle':
        if (!coordinates.bounds) return false;
        return (
          latitude >= coordinates.bounds.south &&
          latitude <= coordinates.bounds.north &&
          longitude >= coordinates.bounds.west &&
          longitude <= coordinates.bounds.east
        );

      default:
        return false;
    }
  }

  private isPointInPolygon(lat: number, lng: number, polygon: { latitude: number; longitude: number }[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (
        polygon[i].longitude > lng !== polygon[j].longitude > lng &&
        lat < ((polygon[j].latitude - polygon[i].latitude) * (lng - polygon[i].longitude)) / (polygon[j].longitude - polygon[i].longitude) + polygon[i].latitude
      ) {
        inside = !inside;
      }
    }
    return inside;
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

  private getSeverityScore(priority: AlertPriority): number {
    switch (priority) {
      case AlertPriority.LOW: return 1;
      case AlertPriority.MEDIUM: return 2;
      case AlertPriority.HIGH: return 3;
      case AlertPriority.CRITICAL: return 4;
      default: return 1;
    }
  }
}
