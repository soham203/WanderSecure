import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TouristService } from './tourist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateLocationDto, UpdatePreferencesDto, UpdateSafetyScoreDto } from './dto/tourist.dto';

@ApiTags('tourists')
@Controller('tourists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TouristController {
  constructor(private readonly touristService: TouristService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current tourist profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Request() req) {
    return this.touristService.getProfile(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update tourist profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Request() req, @Body() updateData: any) {
    return this.touristService.updateProfile(req.user.id, updateData);
  }

  @Post('location')
  @ApiOperation({ summary: 'Update tourist location' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  async updateLocation(@Request() req, @Body() locationDto: UpdateLocationDto) {
    return this.touristService.updateLocation(req.user.id, locationDto);
  }

  @Get('location/history')
  @ApiOperation({ summary: 'Get location history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Location history retrieved successfully' })
  async getLocationHistory(
    @Request() req,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.touristService.getLocationHistory(req.user.id, limit, offset);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update tourist preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  async updatePreferences(@Request() req, @Body() preferencesDto: UpdatePreferencesDto) {
    return this.touristService.updatePreferences(req.user.id, preferencesDto);
  }

  @Put('safety-score')
  @ApiOperation({ summary: 'Update safety score' })
  @ApiResponse({ status: 200, description: 'Safety score updated successfully' })
  async updateSafetyScore(@Request() req, @Body() safetyScoreDto: UpdateSafetyScoreDto) {
    return this.touristService.updateSafetyScore(req.user.id, safetyScoreDto);
  }

  @Post('panic')
  @ApiOperation({ summary: 'Activate panic button' })
  @ApiResponse({ status: 200, description: 'Panic alert activated successfully' })
  async activatePanic(@Request() req) {
    return this.touristService.activatePanic(req.user.id);
  }

  @Post('panic/deactivate')
  @ApiOperation({ summary: 'Deactivate panic button' })
  @ApiResponse({ status: 200, description: 'Panic alert deactivated successfully' })
  async deactivatePanic(@Request() req) {
    return this.touristService.deactivatePanic(req.user.id);
  }

  @Get('safety-alerts')
  @ApiOperation({ summary: 'Get safety alerts for tourist' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Safety alerts retrieved successfully' })
  async getSafetyAlerts(
    @Request() req,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.touristService.getSafetyAlerts(req.user.id, status, limit, offset);
  }

  @Get('safety-score')
  @ApiOperation({ summary: 'Get current safety score' })
  @ApiResponse({ status: 200, description: 'Safety score retrieved successfully' })
  async getSafetyScore(@Request() req) {
    return this.touristService.getSafetyScore(req.user.id);
  }

  @Get('nearby-tourists')
  @ApiOperation({ summary: 'Get nearby tourists' })
  @ApiQuery({ name: 'radius', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Nearby tourists retrieved successfully' })
  async getNearbyTourists(@Request() req, @Query('radius') radius?: number) {
    return this.touristService.getNearbyTourists(req.user.id, radius);
  }
}
