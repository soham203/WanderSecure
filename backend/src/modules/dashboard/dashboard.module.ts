import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Tourist } from '../../entities/tourist.entity';
import { SafetyAlert } from '../../entities/safety-alert.entity';
import { LocationHistory } from '../../entities/location-history.entity';
import { GeoFence } from '../../entities/geo-fence.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tourist, SafetyAlert, LocationHistory, GeoFence]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
