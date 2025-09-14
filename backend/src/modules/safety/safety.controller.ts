import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SafetyService } from './safety.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateGeoFenceDto, UpdateAlertStatusDto } from './dto/safety.dto';

@ApiTags('safety')
@Controller('safety')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SafetyController {
  constructor(private readonly safetyService: SafetyService) {}

  @Get('alerts')
  @ApiOperation({ summary: 'Get all safety alerts' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Safety alerts retrieved successfully' })
  async getAlerts(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.safetyService.getAlerts(status, priority, limit, offset);
  }

  @Get('alerts/:id')
  @ApiOperation({ summary: 'Get safety alert by ID' })
  @ApiResponse({ status: 200, description: 'Safety alert retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  async getAlert(@Param('id') id: string) {
    return this.safetyService.getAlert(id);
  }

  @Put('alerts/:id/status')
  @ApiOperation({ summary: 'Update alert status' })
  @ApiResponse({ status: 200, description: 'Alert status updated successfully' })
  async updateAlertStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateAlertStatusDto,
  ) {
    return this.safetyService.updateAlertStatus(id, updateStatusDto);
  }

  @Get('geo-fences')
  @ApiOperation({ summary: 'Get all geo-fences' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Geo-fences retrieved successfully' })
  async getGeoFences(
    @Query('type') type?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.safetyService.getGeoFences(type, isActive);
  }

  @Post('geo-fences')
  @ApiOperation({ summary: 'Create new geo-fence' })
  @ApiResponse({ status: 201, description: 'Geo-fence created successfully' })
  async createGeoFence(@Body() createGeoFenceDto: CreateGeoFenceDto) {
    return this.safetyService.createGeoFence(createGeoFenceDto);
  }

  @Get('geo-fences/:id')
  @ApiOperation({ summary: 'Get geo-fence by ID' })
  @ApiResponse({ status: 200, description: 'Geo-fence retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Geo-fence not found' })
  async getGeoFence(@Param('id') id: string) {
    return this.safetyService.getGeoFence(id);
  }

  @Get('heatmap')
  @ApiOperation({ summary: 'Get safety heatmap data' })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'timeRange', required: false })
  @ApiResponse({ status: 200, description: 'Heatmap data retrieved successfully' })
  async getHeatmapData(
    @Query('region') region?: string,
    @Query('timeRange') timeRange?: string,
  ) {
    return this.safetyService.getHeatmapData(region, timeRange);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get safety statistics' })
  @ApiQuery({ name: 'period', required: false })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics(@Query('period') period?: string) {
    return this.safetyService.getStatistics(period);
  }

  @Post('anomaly-detection')
  @ApiOperation({ summary: 'Trigger anomaly detection' })
  @ApiResponse({ status: 200, description: 'Anomaly detection triggered successfully' })
  async triggerAnomalyDetection() {
    return this.safetyService.triggerAnomalyDetection();
  }

  @Get('missing-tourists')
  @ApiOperation({ summary: 'Get missing tourists' })
  @ApiResponse({ status: 200, description: 'Missing tourists retrieved successfully' })
  async getMissingTourists() {
    return this.safetyService.getMissingTourists();
  }

  @Post('efir/:touristId')
  @ApiOperation({ summary: 'Generate E-FIR for missing tourist' })
  @ApiResponse({ status: 201, description: 'E-FIR generated successfully' })
  async generateEFIR(@Param('touristId') touristId: string) {
    return this.safetyService.generateEFIR(touristId);
  }
}
