import { Module } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { FileStorageService } from '../../shared/services/file-storage.service';
import { MailModule } from '../mail/mail.module';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Module({
  imports: [MailModule],
  controllers: [CertificatesController],
  providers: [CertificatesService, FileStorageService, PrismaService],
  exports: [CertificatesService],
})
export class CertificatesModule {} 