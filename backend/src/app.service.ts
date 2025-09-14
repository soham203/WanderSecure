import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Smart Tourist Safety API is running! 🚀';
  }

  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Smart Tourist Safety API',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}
