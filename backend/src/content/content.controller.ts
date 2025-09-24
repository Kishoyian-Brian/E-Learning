import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { Content } from './interfaces/content.interface';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { Roles } from '../modules/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  async create(@Body() createContentDto: CreateContentDto): Promise<Content> {
    return this.contentService.create(createContentDto);
  }

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    const result = await this.cloudinaryService.uploadFile(file);
    return {
      url: result.url,
      publicId: result.publicId,
      resourceType: result.resourceType,
      format: result.format,
      bytes: result.bytes,
      originalFilename: result.originalFilename,
    };
  }

  @Post('upload-and-create')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAndCreate(
    @UploadedFile() file: any,
    @Body() body: any,
  ): Promise<Content> {
    // Upload file to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadFile(file);
    
    // Convert form data to proper types
    const contentData = {
      title: body.title,
      description: body.description || null,
      type: body.type,
      moduleId: body.moduleId,
      order: parseInt(body.order, 10),
      visible: body.visible === 'true',
      url: uploadResult.url, // Set automatically from upload
    };
    
    return this.contentService.create(contentData);
  }

  @Get()
  async findAll(): Promise<Content[]> {
    return this.contentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Content> {
    return this.contentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  async update(
    @Param('id') id: string,
    @Body() updateContentDto: UpdateContentDto,
  ): Promise<Content> {
    return this.contentService.update(id, updateContentDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  async remove(@Param('id') id: string): Promise<Content> {
    return this.contentService.remove(id);
  }
}
