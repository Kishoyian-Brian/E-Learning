import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Public } from '../auth/decorators/public.decorator';

@Controller('courses/:courseId/modules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  create(
    @Param('courseId') courseId: string,
    @Body() createModuleDto: CreateModuleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.modulesService.create(courseId, createModuleDto, user as any);
  }

  @Get()
  findByCourse(@Param('courseId') courseId: string) {
    return this.modulesService.findByCourse(courseId);
  }
}

@Controller('modules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StandaloneModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Patch(':moduleId')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  update(
    @Param('moduleId') moduleId: string,
    @Body() updateModuleDto: UpdateModuleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.modulesService.update(moduleId, updateModuleDto, user as any);
  }

  @Delete(':moduleId')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  remove(
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.modulesService.remove(moduleId, user as any);
  }

  @Get(':id/details')
  @Public()
  async getModuleDetails(@Param('id') id: string) {
    const module = await this.modulesService.getModuleById(id);
    if (!module) throw new NotFoundException('Module not found');
    const materials = await this.modulesService.getMaterialsForModule(id);
    return { ...module, materials };
  }
} 