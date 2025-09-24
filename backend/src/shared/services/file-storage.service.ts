import { Injectable, Logger } from '@nestjs/common';
import { writeFile, mkdir, access } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly uploadsDir = join(process.cwd(), 'uploads');
  private readonly certificatesDir = join(this.uploadsDir, 'certificates');

  constructor() {
    this.ensureDirectoriesExist();
  }

  private async ensureDirectoriesExist() {
    try {
      await mkdir(this.uploadsDir, { recursive: true });
      await mkdir(this.certificatesDir, { recursive: true });
    } catch (error) {
      this.logger.error('Failed to create upload directories:', error);
    }
  }

  async saveCertificatePDF(
    pdfBuffer: Buffer,
    certificateNumber: string,
  ): Promise<{ filePath: string; downloadUrl: string }> {
    const fileName = `${certificateNumber}.pdf`;
    const filePath = join(this.certificatesDir, fileName);
    
    try {
      await writeFile(filePath, pdfBuffer);
      
      // Return both file path and download URL
      const downloadUrl = `/api/certificates/download/${fileName}`;
      
      this.logger.log(`Certificate PDF saved: ${filePath}`);
      
      return {
        filePath,
        downloadUrl,
      };
    } catch (error) {
      this.logger.error(`Failed to save certificate PDF: ${error.message}`);
      throw new Error('Failed to save certificate PDF');
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  getFilePath(fileName: string): string {
    return join(this.certificatesDir, fileName);
  }
} 