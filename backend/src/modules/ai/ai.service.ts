import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiServiceUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001';
  }

  async analyzeLocationPattern(touristId: string, locations: any[]): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/analyze-location-pattern`, {
          touristId,
          locations,
        }),
      );
      return (response as any).data;
    } catch (error) {
      this.logger.error('AI service error:', error);
      return { riskScore: 0.5, anomalies: [] };
    }
  }

  async detectAnomalies(touristId: string, recentData: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/detect-anomalies`, {
          touristId,
          data: recentData,
        }),
      );
      return (response as any).data;
    } catch (error) {
      this.logger.error('AI service error:', error);
      return { anomalies: [], riskScore: 0.5 };
    }
  }

  async calculateSafetyScore(touristId: string, factors: any): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/calculate-safety-score`, {
          touristId,
          factors,
        }),
      );
      return (response as any).data.safetyScore;
    } catch (error) {
      this.logger.error('AI service error:', error);
      return 0.5;
    }
  }

  async predictRisk(touristId: string, currentLocation: any, timeOfDay: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/predict-risk`, {
          touristId,
          currentLocation,
          timeOfDay,
        }),
      );
      return (response as any).data;
    } catch (error) {
      this.logger.error('AI service error:', error);
      return { riskLevel: 'medium', confidence: 0.5 };
    }
  }

  async generateInsights(touristId: string, historicalData: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/generate-insights`, {
          touristId,
          historicalData,
        }),
      );
      return (response as any).data;
    } catch (error) {
      this.logger.error('AI service error:', error);
      return { insights: [], recommendations: [] };
    }
  }

  async processEmergencySignal(touristId: string, signalData: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/process-emergency-signal`, {
          touristId,
          signalData,
        }),
      );
      return (response as any).data;
    } catch (error) {
      this.logger.error('AI service error:', error);
      return { priority: 'high', response: 'immediate' };
    }
  }

  async isServiceHealthy(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/health`),
      );
      return (response as any).status === 200;
    } catch (error) {
      this.logger.error('AI service health check failed:', error);
      return false;
    }
  }
}
