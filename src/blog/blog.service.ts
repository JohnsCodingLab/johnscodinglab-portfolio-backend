import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundError } from '@johnscodinglab/enterprise-core';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(onlyPublished = true) {
    return this.prisma.blogPost.findMany({
      where: onlyPublished ? { published: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post) {
      throw new NotFoundError(`Blog post "${slug}" not found`);
    }

    return post;
  }

  async create(dto: CreateBlogPostDto) {
    return this.prisma.blogPost.create({
      data: {
        ...dto,
        publishedAt: dto.published ? new Date() : null,
      },
    });
  }

  async update(slug: string, dto: UpdateBlogPostDto) {
    const existing = await this.findBySlug(slug);

    // Auto-set publishedAt when publishing for the first time
    const publishedAt =
      dto.published && !existing.publishedAt ? new Date() : undefined;

    return this.prisma.blogPost.update({
      where: { slug },
      data: {
        ...dto,
        ...(publishedAt && { publishedAt }),
      },
    });
  }

  async remove(slug: string) {
    await this.findBySlug(slug);
    return this.prisma.blogPost.delete({ where: { slug } });
  }
}
