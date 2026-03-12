import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private fromAddress: string;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.fromAddress = this.config.get<string>('MAIL_FROM')!;

    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('MAIL_HOST'),
      port: Number(this.config.get<string>('MAIL_PORT')),
      secure: true, // true for 465, false for 587
      auth: {
        user: this.config.get<string>('MAIL_USER'),
        pass: this.config.get<string>('MAIL_PASS'),
      },
      logger: true,
      debug: true,
    });

    this.logger.log('Mail transporter initialized');
  }

  async sendContactNotification(contact: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: this.config.get<string>('MAIL_USER'), // Send to yourself
        subject: `🔔 New Contact: ${contact.subject}`,
        html: `
          <h2>New Contact Message</h2>
          <p><strong>From:</strong> ${contact.name} (${contact.email})</p>
          <p><strong>Subject:</strong> ${contact.subject}</p>
          <hr />
          <p>${contact.message.replace(/\n/g, '<br />')}</p>
          <hr />
          <p><em>Reply directly to this person at ${contact.email}</em></p>
        `,
      });
      this.logger.log(`Contact notification sent for: ${contact.email}`);
    } catch (error) {
      this.logger.error('Failed to send contact notification', error);
    }
  }

  async sendReply(to: string, subject: string, replyText: string) {
    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject: `Re: ${subject}`,
        html: `
          <p>${replyText.replace(/\n/g, '<br />')}</p>
          <hr />
          <p><em>— Levi John Favour, JohnsCodingLab</em></p>
        `,
      });
      this.logger.log(`Reply sent to: ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send reply to ${to}`, error);
      throw error; // Re-throw so the controller returns an error
    }
  }
}
