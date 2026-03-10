import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'your-password', minLength: 4 })
  @IsString()
  @MinLength(4, { message: 'Password must be at least 4 characters' })
  password: string;
}
