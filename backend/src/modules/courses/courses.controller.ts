import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ModulesService } from '../modules/modules.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly modulesService: ModulesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  create(@Body() createCourseDto: CreateCourseDto, @CurrentUser() user: JwtPayload) {
    return this.coursesService.create(createCourseDto, user as any);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.coursesService.searchCourses(query);
  }

  @Get('category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.coursesService.getCoursesByCategory(categoryId);
  }

  @Get('difficulty/:difficultyId')
  findByDifficulty(@Param('difficultyId') difficultyId: string) {
    return this.coursesService.getCoursesByDifficulty(difficultyId);
  }

  @Get('instructor/:instructorId')
  findInstructorCourses(@Param('instructorId') instructorId: string) {
    return this.coursesService.findInstructorCourses(instructorId);
  }

  @Get('enrolled')
  @UseGuards(JwtAuthGuard)
  findEnrolledCourses(@CurrentUser() user: JwtPayload) {
    return this.coursesService.findEnrolledCourses(user.sub);
  }

  @Get('my-courses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  findMyCourses(@CurrentUser() user: JwtPayload) {
    return this.coursesService.findInstructorCourses(user.sub);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  async getInstructorStats(@CurrentUser() user: JwtPayload) {
    return this.coursesService.getInstructorStats(user.sub);
  }

  @Get('public')
  @Public()
  async getPublicCourses(
    @Query('category') category?: string,
    @Query('difficulty') difficulty?: string,
  ) {
    return this.coursesService.getPublicCourses(category, difficulty);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Get(':id/details')
  @Public()
  async getCourseDetails(@Param('id') id: string) {
    // Get course
    const course = await this.coursesService.findOne(id);
    // Get modules for course
    const modules = await this.modulesService.findByCourse(id);
    // For each module, get its materials
    const modulesWithMaterials = await Promise.all(
      modules.map(async (mod) => {
        const materials = await this.modulesService.getMaterialsForModule(mod.id);
        return { ...mod, materials };
      })
    );
    return { ...course, modules: modulesWithMaterials };
  }

  @Patch(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.coursesService.update(id, updateCourseDto, user as any);
  }

  @Delete(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.coursesService.remove(id, user as any);
  }
} 