import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard overview statistics' })
  @ApiResponse({ status: 200, description: 'Overview statistics retrieved successfully' })
  async getOverview() {
    return this.dashboardService.getDashboardOverview();
  }

  @Get('tourist-locations')
  @ApiOperation({ summary: 'Get real-time tourist locations' })
  @ApiResponse({ status: 200, description: 'Tourist locations retrieved successfully' })
  async getTouristLocations() {
    return this.dashboardService.getTouristLocations();
  }

  @Get('heatmap')
  @ApiOperation({ summary: 'Get alert heatmap data' })
  @ApiQuery({ name: 'timeRange', required: false, example: '24h' })
  @ApiResponse({ status: 200, description: 'Heatmap data retrieved successfully' })
  async getHeatmap(@Query('timeRange') timeRange?: string) {
    return this.dashboardService.getAlertHeatmap(timeRange);
  }

  @Get('recent-alerts')
  @ApiOperation({ summary: 'Get recent safety alerts' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Recent alerts retrieved successfully' })
  async getRecentAlerts(@Query('limit') limit?: number) {
    return this.dashboardService.getRecentAlerts(limit);
  }

  @Get('tourist-clusters')
  @ApiOperation({ summary: 'Get tourist clusters' })
  @ApiQuery({ name: 'radius', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Tourist clusters retrieved successfully' })
  async getTouristClusters(@Query('radius') radius?: number) {
    return this.dashboardService.getTouristClusters(radius);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get detailed statistics' })
  @ApiQuery({ name: 'timeRange', required: false, example: '24h' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics(@Query('timeRange') timeRange?: string) {
    return this.dashboardService.getStatistics(timeRange);
  }

  @Get('geo-fence-status')
  @ApiOperation({ summary: 'Get geo-fence status' })
  @ApiResponse({ status: 200, description: 'Geo-fence status retrieved successfully' })
  async getGeoFenceStatus() {
    return this.dashboardService.getGeoFenceStatus();
  }
}
