import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { ProgressValidationService } from './progress-validation.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CertificatesModule } from '../certificates/certificates.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [CertificatesModule, MailModule],
  controllers: [ProgressController],
  providers: [ProgressService, ProgressValidationService, PrismaService],
  exports: [ProgressService, ProgressValidationService],
})
export class ProgressModule {}
