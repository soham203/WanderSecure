import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BlockchainService } from './blockchain.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('blockchain')
@Controller('blockchain')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Post('generate-id')
  @ApiOperation({ summary: 'Generate digital ID for tourist' })
  @ApiResponse({ status: 201, description: 'Digital ID generated successfully' })
  async generateDigitalId(@Body() touristData: any) {
    const digitalId = await this.blockchainService.generateDigitalId(touristData);
    return { digitalId };
  }

  @Get('verify/:digitalId')
  @ApiOperation({ summary: 'Verify digital ID' })
  @ApiResponse({ status: 200, description: 'Digital ID verification result' })
  async verifyDigitalId(@Param('digitalId') digitalId: string) {
    const isValid = await this.blockchainService.verifyDigitalId(digitalId);
    return { digitalId, isValid };
  }

  @Get('data/:digitalId')
  @ApiOperation({ summary: 'Get digital ID data' })
  @ApiResponse({ status: 200, description: 'Digital ID data retrieved successfully' })
  async getDigitalIdData(@Param('digitalId') digitalId: string) {
    const data = await this.blockchainService.getDigitalIdData(digitalId);
    return data;
  }

  @Get('history/:digitalId')
  @ApiOperation({ summary: 'Get digital ID history' })
  @ApiResponse({ status: 200, description: 'Digital ID history retrieved successfully' })
  async getDigitalIdHistory(@Param('digitalId') digitalId: string) {
    const history = await this.blockchainService.getDigitalIdHistory(digitalId);
    return history;
  }

  @Post('revoke/:digitalId')
  @ApiOperation({ summary: 'Revoke digital ID' })
  @ApiResponse({ status: 200, description: 'Digital ID revoked successfully' })
  async revokeDigitalId(@Param('digitalId') digitalId: string) {
    const success = await this.blockchainService.revokeDigitalId(digitalId);
    return { success, message: success ? 'Digital ID revoked successfully' : 'Failed to revoke digital ID' };
  }
}
