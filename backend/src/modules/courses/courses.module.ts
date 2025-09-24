import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CategoryController } from './category.controller';
import { DifficultyController } from './difficulty.controller';
import { ModulesModule } from '../modules/modules.module';

@Module({
  imports: [ModulesModule],
  controllers: [CoursesController, CategoryController, DifficultyController],
  providers: [CoursesService, PrismaService],
  exports: [CoursesService],
})
export class CoursesModule {}
