import { Module } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { DiscussionsController } from './discussions.controller';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [DiscussionsController],
  providers: [DiscussionsService, PrismaService],
  exports: [DiscussionsService],
})
export class DiscussionsModule {} 