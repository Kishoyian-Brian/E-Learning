import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  create(@Body() createEnrollmentDto: CreateEnrollmentDto, @CurrentUser() user: JwtPayload) {
    return this.enrollmentService.create(createEnrollmentDto, user.sub);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.enrollmentService.findAll();
  }

  @Get('my-enrollments')
  findMyEnrollments(@CurrentUser() user: JwtPayload) {
    return this.enrollmentService.findByUser(user.sub);
  }

  @Get('course/:courseId')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  findByCourse(@Param('courseId') courseId: string) {
    return this.enrollmentService.findByCourse(courseId);
  }

  @Get('course/:courseId/stats')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  getCourseStats(@Param('courseId') courseId: string) {
    return this.enrollmentService.getCourseStats(courseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enrollmentService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.enrollmentService.update(id, updateEnrollmentDto, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.enrollmentService.remove(id, user.sub);
  }
} 