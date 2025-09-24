import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { Content } from './interfaces/content.interface';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createContentDto: CreateContentDto): Promise<Content> {
    return await this.prisma.material.create({ data: createContentDto });
  }

  async findAll(): Promise<Content[]> {
    return await this.prisma.material.findMany();
  }

  async findOne(id: string): Promise<Content> {
    const content = await this.prisma.material.findUnique({ where: { id } });
    if (!content) {
      throw new NotFoundException('Content not found');
    }
    return content;
  }

  async update(
    id: string,
    updateContentDto: UpdateContentDto,
  ): Promise<Content> {
    await this.findOne(id); // Throws if not found
    return await this.prisma.material.update({
      where: { id },
      data: updateContentDto,
    });
  }

  async remove(id: string): Promise<Content> {
    await this.findOne(id); // Throws if not found
    return await this.prisma.material.delete({ where: { id } });
  }
}
