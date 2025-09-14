import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SafetyController } from './safety.controller';
import { SafetyService } from './safety.service';
import { SafetyAlert } from '../../entities/safety-alert.entity';
import { GeoFence } from '../../entities/geo-fence.entity';
import { Tourist } from '../../entities/tourist.entity';
import { LocationHistory } from '../../entities/location-history.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SafetyAlert, GeoFence, Tourist, LocationHistory]),
    NotificationModule,
  ],
  controllers: [SafetyController],
  providers: [SafetyService],
  exports: [SafetyService],
})
export class SafetyModule {}
