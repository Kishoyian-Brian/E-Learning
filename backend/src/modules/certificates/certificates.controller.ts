import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  HttpStatus,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FileStorageService } from '../../shared/services/file-storage.service';
import { createReadStream } from 'fs';

@Controller('certificates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CertificatesController {
  constructor(
    private readonly certificatesService: CertificatesService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  @Post()
  @Roles('INSTRUCTOR', 'ADMIN')
  async createCertificate(
    @Body() createCertificateDto: CreateCertificateDto,
    @CurrentUser() user: any,
  ) {
    return this.certificatesService.createCertificate(
      createCertificateDto,
      user.sub,
    );
  }

  @Post('generate-for-completion/:enrollmentId')
  @Roles('STUDENT', 'INSTRUCTOR', 'ADMIN')
  async generateCertificateForCompletion(
    @Param('enrollmentId') enrollmentId: string,
    @CurrentUser() user: any,
  ) {
    return this.certificatesService.generateCertificateForCourseCompletion(
      enrollmentId,
      user.sub,
    );
  }

  @Get()
  @Roles('ADMIN')
  async findAll() {
    return this.certificatesService.findAll();
  }

  @Get('my-certificates')
  @Roles('STUDENT', 'INSTRUCTOR', 'ADMIN')
  async findMyCertificates(@CurrentUser() user: any) {
    return this.certificatesService.findByUser(user.sub);
  }

  @Get(':id')
  @Roles('STUDENT', 'INSTRUCTOR', 'ADMIN')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.certificatesService.findOne(id, user.sub);
  }

  @Get('verify/:verificationCode')
  @Public()
  async verifyCertificate(@Param('verificationCode') verificationCode: string) {
    return this.certificatesService.verifyCertificate(verificationCode);
  }

  @Post(':id/revoke')
  @Roles('INSTRUCTOR', 'ADMIN')
  async revokeCertificate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.certificatesService.revokeCertificate(id, user.sub);
  }

  @Post('regenerate-pdf/:certificateId')
  @Roles('INSTRUCTOR', 'ADMIN')
  async regenerateCertificatePDF(
    @Param('certificateId') certificateId: string,
    @CurrentUser() user: any,
  ) {
    try {
      const certificate = await this.certificatesService.findOne(certificateId, user.sub);
      if (!certificate) {
        throw new NotFoundException('Certificate not found');
      }

      // Regenerate the PDF
      const pdfUrl = await this.certificatesService.generateCertificatePDF(certificateId);
      
      // Update the certificate with the new PDF URL
      const updatedCertificate = await this.certificatesService.updateCertificateUrl(certificateId, pdfUrl);
      
      return {
        message: 'Certificate PDF regenerated successfully',
        certificate: updatedCertificate
      };
    } catch (error) {
      console.error('Error regenerating certificate PDF:', error);
      throw error;
    }
  }

  @Get('download/:fileName')
  @Public()
  async downloadCertificate(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    try {
      console.log(`Attempting to download certificate: ${fileName}`);
      
      const filePath = this.fileStorageService.getFilePath(fileName);
      console.log(`File path: ${filePath}`);
      
      const fileExists = await this.fileStorageService.fileExists(filePath);
      console.log(`File exists: ${fileExists}`);
      
      if (!fileExists) {
        console.error(`Certificate file not found: ${filePath}`);
        return res.status(HttpStatus.NOT_FOUND).json({
          error: 'Certificate file not found',
          fileName: fileName,
          filePath: filePath
        });
      }

      const fileStream = createReadStream(filePath);
      
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/pdf');
      
      fileStream.on('error', (error) => {
        console.error('Error reading certificate file:', error);
        if (!res.headersSent) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: 'Error reading certificate file',
            details: error.message
          });
        }
      });
      
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error in downloadCertificate:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Error downloading certificate',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
