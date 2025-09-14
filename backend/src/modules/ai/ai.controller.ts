import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check AI service health' })
  @ApiResponse({ status: 200, description: 'AI service health status' })
  async checkHealth() {
    const isHealthy = await this.aiService.isServiceHealthy();
    return { 
      service: 'AI Service',
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString()
    };
  }

  @Post('analyze-location/:touristId')
  @ApiOperation({ summary: 'Analyze tourist location pattern' })
  @ApiResponse({ status: 200, description: 'Location analysis completed' })
  async analyzeLocationPattern(
    @Param('touristId') touristId: string,
    @Body() body: { locations: any[] }
  ) {
    return this.aiService.analyzeLocationPattern(touristId, body.locations);
  }

  @Post('detect-anomalies/:touristId')
  @ApiOperation({ summary: 'Detect anomalies in tourist behavior' })
  @ApiResponse({ status: 200, description: 'Anomaly detection completed' })
  async detectAnomalies(
    @Param('touristId') touristId: string,
    @Body() body: { data: any }
  ) {
    return this.aiService.detectAnomalies(touristId, body.data);
  }

  @Post('calculate-safety-score/:touristId')
  @ApiOperation({ summary: 'Calculate safety score for tourist' })
  @ApiResponse({ status: 200, description: 'Safety score calculated' })
  async calculateSafetyScore(
    @Param('touristId') touristId: string,
    @Body() body: { factors: any }
  ) {
    const safetyScore = await this.aiService.calculateSafetyScore(touristId, body.factors);
    return { touristId, safetyScore };
  }

  @Post('predict-risk/:touristId')
  @ApiOperation({ summary: 'Predict risk for tourist at current location' })
  @ApiResponse({ status: 200, description: 'Risk prediction completed' })
  async predictRisk(
    @Param('touristId') touristId: string,
    @Body() body: { location: any; timeOfDay: string }
  ) {
    return this.aiService.predictRisk(touristId, body.location, body.timeOfDay);
  }

  @Post('analyze-behavior/:touristId')
  @ApiOperation({ summary: 'Analyze tourist behavior patterns' })
  @ApiResponse({ status: 200, description: 'Behavior analysis completed' })
  async analyzeBehavior(
    @Param('touristId') touristId: string,
    @Body() body: { behavior: any }
  ) {
    return this.aiService.analyzeBehavior(touristId, body.behavior);
  }

  @Post('generate-insights/:touristId')
  @ApiOperation({ summary: 'Generate insights for tourist' })
  @ApiResponse({ status: 200, description: 'Insights generated' })
  async generateInsights(
    @Param('touristId') touristId: string,
    @Body() body: { data: any }
  ) {
    return this.aiService.generateInsights(touristId, body.data);
  }
}
