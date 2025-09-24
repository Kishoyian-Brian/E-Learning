/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import puppeteer from 'puppeteer';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    this.logger.log('Cloudinary service initialized');
  }

  /**
   * Upload any file (image, video, pdf, etc.) to Cloudinary.
   * @param file The file to upload (from Multer)
   * @param folder Optional folder in Cloudinary
   */
  async uploadFile(
    file: any,
    folder: string = 'content-materials',
  ): Promise<{
    url: string;
    publicId: string;
    resourceType: string;
    format: string; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    bytes: number;
    originalFilename: string;
  }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error: any, result: any) => {
          const errorMsg = (error && typeof error === 'object' && 'message' in error) ? error.message : String(error);
          if (error) {
            this.logger.error(`Cloudinary upload failed: ${errorMsg}`);
            reject(new Error(errorMsg || 'Cloudinary upload failed'));
          } else if (result && typeof result === 'object') {
            this.logger.log(`File uploaded successfully: ${result?.public_id}`);
            resolve({
              url: typeof result.secure_url === 'string' ? result.secure_url : '',
              publicId: typeof result.public_id === 'string' ? result.public_id : '',
              resourceType: typeof result.resource_type === 'string' ? result.resource_type : '',
              format: typeof result.format === 'string' ? result.format : '',
              bytes: typeof result.bytes === 'number' ? result.bytes : 0,
              originalFilename: typeof result.original_filename === 'string' ? result.original_filename : '',
            });
          } else {
            reject(new Error('Upload failed - no result returned'));
          }
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  /**
   * Delete a file from Cloudinary by publicId
   */
  async deleteFile(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        { resource_type: 'auto' },
        (error: any) => {
          const errorMsg = (error && typeof error === 'object' && 'message' in error) ? error.message : String(error);
          if (error) {
            this.logger.error(`Failed to delete file ${publicId}: ${errorMsg}`);
            reject(new Error(errorMsg || 'Failed to delete file'));
          } else {
            this.logger.log(`File deleted successfully: ${publicId}`);
            resolve();
          }
        },
      );
    });
  }

  /**
   * Extract publicId from a Cloudinary URL
   */
  extractPublicIdFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex((part) => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
        const folderAndFile = urlParts.slice(uploadIndex + 2).join('/');
        const publicId = folderAndFile.split('.')[0]; // Remove file extension
        return publicId;
      }
      return null;
    } catch (error: any) {
      const errorMsg = (error && typeof error === 'object' && 'message' in error) ? error.message : String(error);
      this.logger.error(`Failed to extract public ID from URL: ${errorMsg}`);
      return null;
    }
  }

  /**
   * Get a Multer storage engine for direct uploads to Cloudinary (optional)
   */
  getCloudinaryStorage(folder: string = 'content-materials') {
    return new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder,
        resource_type: 'auto',
      } as any,
    });
  }

  async generateImageUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
      format?: string;
    } = {},
  ): Promise<string> {
    const transformation: any[] = [];

    if (options.width || options.height) {
      transformation.push({
        width: options.width,
        height: options.height,
        crop: options.crop || 'limit',
      });
    }

    if (options.quality) {
      transformation.push({ quality: options.quality });
    }

    if (options.format) {
      transformation.push({ fetch_format: options.format });
    }

    return cloudinary.url(publicId, {
      secure: true,
      transformation,
    });
  }

  async getImageInfo(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.api.resource(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Upload HTML content as a PDF to Cloudinary using Puppeteer
   */
  async uploadHTMLAsPDF(
    htmlContent: string,
    options: {
      folder?: string;
      public_id?: string;
    } = {},
  ): Promise<{ secure_url: string; public_id: string }> {
    // 1. Generate PDF buffer from HTML using Puppeteer
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // 2. Upload PDF buffer to Cloudinary with proper public access
    return new Promise((resolve, reject) => {
      const uploadStream = (global as any).cloudinary?.uploader?.upload_stream || require('cloudinary').v2.uploader.upload_stream;
      uploadStream(
        {
          folder: options.folder || 'certificates',
          public_id: options.public_id,
          resource_type: 'raw',
          format: 'pdf',
          access_mode: 'public',
          type: 'upload', // Ensure public upload type
        },
        (error: any, result: any) => {
          if (error) {
            this.logger.error(`Failed to upload PDF: ${error.message}`);
            reject(new Error(error.message || 'Failed to upload PDF'));
          } else {
            this.logger.log(`PDF uploaded successfully: ${result.public_id}`);
            
            // Generate download URL with fl_attachment
            const downloadUrl = this.generateDownloadUrl(result.secure_url);
            
            resolve({
              secure_url: downloadUrl, // Use download URL as primary
              public_id: result.public_id,
            });
          }
        },
      ).end(pdfBuffer);
    });
  }

  /**
   * Generate download URL with fl_attachment
   */
  private generateDownloadUrl(originalUrl: string): string {
    return originalUrl.replace('/upload/', '/upload/fl_attachment/');
  }
}
