import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('test-email')
  @ApiOperation({ summary: 'Send test email' })
  @ApiResponse({ status: 200, description: 'Test email sent successfully' })
  async sendTestEmail(@Body() body: { to: string; subject: string; message: string }) {
    await this.notificationService.sendEmail(body.to, body.subject, body.message);
    return { message: 'Test email sent successfully' };
  }

  @Post('test-sms')
  @ApiOperation({ summary: 'Send test SMS' })
  @ApiResponse({ status: 200, description: 'Test SMS sent successfully' })
  async sendTestSMS(@Body() body: { to: string; message: string }) {
    await this.notificationService.sendSMS(body.to, body.message);
    return { message: 'Test SMS sent successfully' };
  }
}
