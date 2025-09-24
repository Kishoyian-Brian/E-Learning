import { Module } from '@nestjs/common';
import { ModulesController, StandaloneModulesController } from './modules.controller';
import { ModulesService } from './modules.service';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Module({
  controllers: [ModulesController, StandaloneModulesController],
  providers: [ModulesService, PrismaService],
  exports: [ModulesService],
})
export class ModulesModule {} 