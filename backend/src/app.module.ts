import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { TouristModule } from './modules/tourist/tourist.module';
import { SafetyModule } from './modules/safety/safety.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { AiModule } from './modules/ai/ai.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationModule } from './modules/notification/notification.module';
import { DatabaseModule } from './config/database.module';
import { RedisModule } from './config/redis.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    TouristModule,
    SafetyModule,
    BlockchainModule,
    AiModule,
    DashboardModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
