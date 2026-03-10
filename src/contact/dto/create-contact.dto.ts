import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Project Inquiry' })
  @IsString()
  @MinLength(2)
  subject: string;

  @ApiProperty({ example: 'Hi, I would like to collaborate on a project...' })
  @IsString()
  @MinLength(10)
  message: string;
}
