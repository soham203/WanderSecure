import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SafetyAlert } from '../../entities/safety-alert.entity';
import { GeoFence } from '../../entities/geo-fence.entity';
import * as nodemailer from 'nodemailer';
import * as twilio from 'twilio';

@Injectable()
export class NotificationService {
  private emailTransporter: nodemailer.Transporter;
  private twilioClient: twilio.Twilio;

  constructor(private configService: ConfigService) {
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransporter({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });

    // Initialize Twilio client
    this.twilioClient = twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
    );
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.emailTransporter.sendMail({
        from: this.configService.get('SMTP_FROM', 'noreply@touristsafety.gov.in'),
        to,
        subject,
        html,
      });
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }

  async sendSMS(to: string, message: string) {
    try {
      await this.twilioClient.messages.create({
        body: message,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to,
      });
      console.log(`SMS sent to ${to}`);
    } catch (error) {
      console.error('SMS sending failed:', error);
    }
  }

  async sendPushNotification(deviceToken: string, title: string, body: string, data?: any) {
    // In a real implementation, this would use Firebase Cloud Messaging or similar
    console.log(`Push notification sent to ${deviceToken}: ${title} - ${body}`);
  }

  async notifyPanicAlert(alert: SafetyAlert) {
    const message = `
🚨 PANIC ALERT ACTIVATED 🚨

Tourist: ${alert.tourist.firstName} ${alert.tourist.lastName}
Digital ID: ${alert.tourist.digitalId}
Phone: ${alert.tourist.phoneNumber}
Location: ${alert.address || 'Unknown'}
Coordinates: ${alert.latitude}, ${alert.longitude}
Time: ${alert.createdAt}

This is an emergency situation requiring immediate response.
    `;

    // Notify emergency contacts
    for (const contact of alert.tourist.emergencyContacts) {
      await this.sendSMS(contact.phone, message);
    }

    // Notify authorities
    await this.notifyEmergencyServices(alert);
  }

  async notifyGeoFenceViolation(alert: SafetyAlert, geoFence: GeoFence) {
    const message = `
⚠️ GEO-FENCE VIOLATION ⚠️

Tourist: ${alert.tourist.firstName} ${alert.tourist.lastName}
Digital ID: ${alert.tourist.digitalId}
Violated Zone: ${geoFence.name}
Location: ${alert.address || 'Unknown'}
Coordinates: ${alert.latitude}, ${alert.longitude}
Time: ${alert.createdAt}

Tourist has entered a restricted area.
    `;

    // Notify authorities
    await this.notifyEmergencyServices(alert);
  }

  async notifyEmergencyServices(alert: SafetyAlert) {
    const emergencyContacts = [
      '+919876543210', // Police control room
      '+919876543211', // Tourism department
      '+919876543212', // Emergency services
    ];

    const message = `
🚨 EMERGENCY ALERT 🚨

Alert Type: ${alert.alertType}
Priority: ${alert.priority}
Tourist: ${alert.tourist.firstName} ${alert.tourist.lastName}
Digital ID: ${alert.tourist.digitalId}
Phone: ${alert.tourist.phoneNumber}
Location: ${alert.address || 'Unknown'}
Coordinates: ${alert.latitude}, ${alert.longitude}
Time: ${alert.createdAt}

Please respond immediately.
    `;

    for (const contact of emergencyContacts) {
      await this.sendSMS(contact, message);
    }

    // Send email to control room
    await this.sendEmail(
      'controlroom@touristsafety.gov.in',
      `Emergency Alert - ${alert.alertType}`,
      message.replace(/\n/g, '<br>'),
    );
  }

  async notifyAlertStatusChange(alert: SafetyAlert) {
    const message = `
📋 ALERT STATUS UPDATE

Alert ID: ${alert.id}
Status: ${alert.status}
Tourist: ${alert.tourist.firstName} ${alert.tourist.lastName}
Updated: ${new Date().toISOString()}

${alert.resolutionNotes ? `Notes: ${alert.resolutionNotes}` : ''}
    `;

    // Notify tourist's emergency contacts
    for (const contact of alert.tourist.emergencyContacts) {
      await this.sendSMS(contact.phone, message);
    }
  }

  async notifyMissingPerson(alert: SafetyAlert) {
    const message = `
🔍 MISSING PERSON ALERT

Tourist: ${alert.tourist.firstName} ${alert.tourist.lastName}
Digital ID: ${alert.tourist.digitalId}
Phone: ${alert.tourist.phoneNumber}
Last Known Location: ${alert.address || 'Unknown'}
Last Seen: ${alert.tourist.lastLocationUpdate}
Reported: ${alert.createdAt}

Please contact authorities if you have any information.
    `;

    // Notify emergency contacts
    for (const contact of alert.tourist.emergencyContacts) {
      await this.sendSMS(contact.phone, message);
    }

    // Notify authorities
    await this.notifyEmergencyServices(alert);
  }

  async notifySafetyScoreUpdate(touristId: string, newScore: string) {
    // This would typically send a push notification to the mobile app
    console.log(`Safety score updated for tourist ${touristId}: ${newScore}`);
  }

  async notifyLocationUpdate(touristId: string, location: any) {
    // This would typically send a push notification to family members
    console.log(`Location update for tourist ${touristId}: ${location.latitude}, ${location.longitude}`);
  }
}
