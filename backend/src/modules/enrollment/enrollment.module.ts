import { Module } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [EnrollmentController],
  providers: [EnrollmentService, PrismaService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {} 