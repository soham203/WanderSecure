import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
  private aiServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get('AI_SERVICE_URL', 'http://localhost:8001');
  }

  async analyzeLocationPattern(touristId: string, locations: any[]): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/analyze-location-pattern`, {
          touristId,
          locations,
        }),
      );
      return response.data;
    } catch (error) {
      console.error('AI service error:', error);
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
      return response.data;
    } catch (error) {
      console.error('AI service error:', error);
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
      return response.data.safetyScore;
    } catch (error) {
      console.error('AI service error:', error);
      return 0.5; // Default medium risk
    }
  }

  async predictRisk(touristId: string, currentLocation: any, timeOfDay: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/predict-risk`, {
          touristId,
          location: currentLocation,
          timeOfDay,
        }),
      );
      return response.data;
    } catch (error) {
      console.error('AI service error:', error);
      return { riskLevel: 'medium', confidence: 0.5 };
    }
  }

  async analyzeBehavior(touristId: string, behaviorData: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/analyze-behavior`, {
          touristId,
          behavior: behaviorData,
        }),
      );
      return response.data;
    } catch (error) {
      console.error('AI service error:', error);
      return { isNormal: true, confidence: 0.5 };
    }
  }

  async generateInsights(touristId: string, historicalData: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/generate-insights`, {
          touristId,
          data: historicalData,
        }),
      );
      return response.data;
    } catch (error) {
      console.error('AI service error:', error);
      return { insights: [], recommendations: [] };
    }
  }

  async isServiceHealthy(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/health`),
      );
      return response.status === 200;
    } catch (error) {
      console.error('AI service health check failed:', error);
      return false;
    }
  }
}
