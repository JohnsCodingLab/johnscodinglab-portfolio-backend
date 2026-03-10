import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundError } from '@johnscodinglab/enterprise-core';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(onlyPublished = true) {
    return this.prisma.project.findMany({
      where: onlyPublished ? { published: true } : undefined,
      orderBy: [
        { featured: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
    });

    if (!project) {
      throw new NotFoundError(`Project "${slug}" not found`);
    }

    return project;
  }

  async create(dto: CreateProjectDto) {
    return this.prisma.project.create({ data: dto });
  }

  async update(slug: string, dto: UpdateProjectDto) {
    await this.findBySlug(slug); // throws NotFoundError if not found

    return this.prisma.project.update({
      where: { slug },
      data: dto,
    });
  }

  async remove(slug: string) {
    await this.findBySlug(slug); // throws NotFoundError if not found

    return this.prisma.project.delete({ where: { slug } });
  }
}
