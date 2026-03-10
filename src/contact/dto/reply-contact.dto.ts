import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplyContactDto {
  @ApiProperty({
    example: 'Thank you for reaching out! I would love to collaborate...',
  })
  @IsString()
  @MinLength(10)
  message: string;
}
