import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBlogPostDto {
  @ApiProperty({ example: 'Understanding JWT Authentication' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: 'understanding-jwt-authentication' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'Full markdown blog post content here...' })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    example: 'A quick overview of how JWTs work under the hood.',
  })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/blog-cover.png' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ example: ['auth', 'security', 'nodejs'] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
