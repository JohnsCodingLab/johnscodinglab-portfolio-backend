import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundError } from '@johnscodinglab/enterprise-core';
import { MailService } from '../mail/mail.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ReplyContactDto } from './dto/reply-contact.dto';
import { NotificationsGateway } from 'src/notifications/notification.gateway';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly notifications: NotificationsGateway,
  ) {}

  async submit(dto: CreateContactDto) {
    const message = await this.prisma.contactMessage.create({ data: dto });

    // Fire-and-forget: email notification to admin
    this.mail.sendContactNotification(dto);

    // Real-time: push to admin dashboard
    this.notifications.notifyNewMessage({
      id: message.id,
      name: message.name,
      subject: message.subject,
      email: message.email,
      createdAt: message.createdAt,
    });

    return message;
  }

  async findAll() {
    return this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const message = await this.prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    return message;
  }

  async markAsRead(id: string) {
    await this.findOne(id);

    return this.prisma.contactMessage.update({
      where: { id },
      data: { read: true },
    });
  }

  async reply(id: string, dto: ReplyContactDto) {
    const message = await this.findOne(id);

    // Send the reply email to the original sender
    await this.mail.sendReply(message.email, message.subject, dto.message);

    // Record the reply in the database
    return this.prisma.contactMessage.update({
      where: { id },
      data: {
        repliedAt: new Date(),
        replyText: dto.message,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.contactMessage.delete({ where: { id } });
  }
}
