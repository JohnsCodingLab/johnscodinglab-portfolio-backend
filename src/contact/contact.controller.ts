import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReplyContactDto } from './dto/reply-contact.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per 60 secs
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a contact message (public)' })
  submit(@Body() dto: CreateContactDto) {
    return this.contactService.submit(dto);
  }

  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'List all contact messages (admin only)' })
  findAll() {
    return this.contactService.findAll();
  }

  @Roles('admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get a single message (admin only)' })
  findOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  @Roles('admin')
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a message as read (admin only)' })
  markAsRead(@Param('id') id: string) {
    return this.contactService.markAsRead(id);
  }

  @Roles('admin')
  @Post(':id/reply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reply to a contact message (admin only)' })
  reply(@Param('id') id: string, @Body() dto: ReplyContactDto) {
    return this.contactService.reply(id, dto);
  }

  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a message (admin only)' })
  remove(@Param('id') id: string) {
    return this.contactService.remove(id);
  }
}
