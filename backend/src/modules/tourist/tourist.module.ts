import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TouristController } from './tourist.controller';
import { TouristService } from './tourist.service';
import { Tourist } from '../../entities/tourist.entity';
import { LocationHistory } from '../../entities/location-history.entity';
import { SafetyAlert } from '../../entities/safety-alert.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tourist, LocationHistory, SafetyAlert]),
  ],
  controllers: [TouristController],
  providers: [TouristService],
  exports: [TouristService],
})
export class TouristModule {}
