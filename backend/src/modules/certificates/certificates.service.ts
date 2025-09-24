import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { FileStorageService } from '../../shared/services/file-storage.service';
import { MailService } from '../mail/mail.service';
import {
  Certificate,
  CertificateWithDetails,
  CreateCertificateDto,
  CertificateVerificationResult,
  CertificateTemplate,
} from './interfaces/certificate.interface';
import { randomBytes } from 'crypto';
import * as puppeteer from 'puppeteer';

@Injectable()
export class CertificatesService {
  constructor(
    private prisma: PrismaService,
    private fileStorageService: FileStorageService,
    private mailService: MailService,
  ) {}

  async createCertificate(
    createCertificateDto: CreateCertificateDto,
    instructorId: string,
  ): Promise<Certificate> {
    // Verify the instructor has permission to create certificates for this course
    const course = await this.prisma.course.findFirst({
      where: {
        id: createCertificateDto.courseId,
        instructorId,
      },
    });

    if (!course) {
      throw new ForbiddenException(
        'You can only create certificates for your own courses',
      );
    }

    // Verify the enrollment exists and belongs to the user
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        id: createCertificateDto.enrollmentId,
        userId: createCertificateDto.userId,
        courseId: createCertificateDto.courseId,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Generate unique certificate number and verification code
    const certificateNumber = this.generateCertificateNumber();
    const verificationCode = this.generateVerificationCode();

    // Create certificate record
    const certificate = await this.prisma.certificate.create({
      data: {
        userId: createCertificateDto.userId,
        courseId: createCertificateDto.courseId,
        enrollmentId: createCertificateDto.enrollmentId,
        certificateNumber,
        verificationCode,
        type: createCertificateDto.type,
        issuedAt: new Date(),
        expiresAt: createCertificateDto.expiresAt
          ? new Date(createCertificateDto.expiresAt)
          : null,
        status: 'ACTIVE',
        metadata: createCertificateDto.metadata || {},
      },
    });

    // Generate PDF certificate
    const pdfResult = await this.generateCertificatePDF(certificate.id);

    // Update certificate with PDF URL
    const updatedCertificate = await this.prisma.certificate.update({
      where: { id: certificate.id },
      data: { certificateUrl: pdfResult },
    });

    // Send email notification to student
    await this.sendCertificateEmail(certificate.id);

    return updatedCertificate as Certificate;
  }

  async generateCertificateForCourseCompletion(
    enrollmentId: string,
    userId: string,
  ): Promise<Certificate> {
    // Get enrollment with course details
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        userId,
      },
      include: {
        course: {
          include: {
            instructor: true,
          },
        },
        user: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Check if certificate already exists
    const existingCertificate = await this.prisma.certificate.findFirst({
      where: {
        enrollmentId,
        type: 'COMPLETION',
      },
    });

    if (existingCertificate) {
      return existingCertificate as Certificate;
    }

    // Create completion certificate
    const createCertificateDto: CreateCertificateDto = {
      userId,
      courseId: enrollment.courseId,
      enrollmentId,
      type: 'COMPLETION',
    };

    return this.createCertificate(
      createCertificateDto,
      enrollment.course.instructorId,
    );
  }

  async findAll(): Promise<CertificateWithDetails[]> {
    return this.prisma.certificate.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        enrollment: {
          select: {
            id: true,
            enrolledAt: true,
          },
        },
      },
    }) as Promise<CertificateWithDetails[]>;
  }

  async findByUser(userId: string): Promise<CertificateWithDetails[]> {
    return this.prisma.certificate.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        enrollment: {
          select: {
            id: true,
            enrolledAt: true,
          },
        },
      },
    }) as Promise<CertificateWithDetails[]>;
  }

  async findOne(id: string, userId: string): Promise<CertificateWithDetails> {
    const certificate = await this.prisma.certificate.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        enrollment: {
          select: {
            id: true,
            enrolledAt: true,
          },
        },
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate as CertificateWithDetails;
  }

  async verifyCertificate(
    verificationCode: string,
  ): Promise<CertificateVerificationResult> {
    const certificate = await this.prisma.certificate.findFirst({
      where: {
        verificationCode,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        enrollment: {
          select: {
            id: true,
            enrolledAt: true,
          },
        },
      },
    });

    if (!certificate) {
      return {
        isValid: false,
        reason: 'Certificate not found or invalid verification code',
      };
    }

    // Check if certificate is expired
    if (certificate.expiresAt && certificate.expiresAt < new Date()) {
      return {
        isValid: false,
        reason: 'Certificate has expired',
      };
    }

    return {
      isValid: true,
      certificate: certificate as CertificateWithDetails,
    };
  }

  async revokeCertificate(
    id: string,
    instructorId: string,
  ): Promise<Certificate> {
    const certificate = await this.prisma.certificate.findFirst({
      where: { id },
      include: {
        course: {
          select: {
            instructorId: true,
          },
        },
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    if (certificate.course.instructorId !== instructorId) {
      throw new ForbiddenException(
        'You can only revoke certificates for your own courses',
      );
    }

    return this.prisma.certificate.update({
      where: { id },
      data: { status: 'REVOKED' },
    }) as Promise<Certificate>;
  }

  private generateCertificateNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(4).toString('hex');
    return `CERT-${timestamp}-${random}`.toUpperCase();
  }

  private generateVerificationCode(): string {
    return randomBytes(16).toString('hex');
  }

  async generateCertificatePDF(certificateId: string): Promise<string> {
    try {
      console.log(`Generating PDF for certificate: ${certificateId}`);
      
    // Get certificate data with all details
    const certificate = await this.prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        course: {
          select: {
            title: true,
            instructor: {
              select: {
                name: true,
              },
            },
          },
        },
        enrollment: {
          select: {
            enrolledAt: true,
          },
        },
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

      console.log(`Certificate data retrieved for: ${certificate.certificateNumber}`);

    // Create certificate template data
    const templateData: CertificateTemplate = {
      studentName: certificate.user.name,
      courseName: certificate.course.title,
      completionDate: certificate.issuedAt.toLocaleDateString(),
      instructorName: certificate.course.instructor.name,
      certificateNumber: certificate.certificateNumber,
      verificationCode: certificate.verificationCode,
    };

    // Generate HTML content
    const htmlContent = this.generateCertificateHTML(templateData);
      console.log('HTML content generated successfully');
    
    // Generate PDF using Puppeteer
      console.log('Starting Puppeteer browser...');
    const browser = await puppeteer.launch({ 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] 
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      console.log('Page content set, generating PDF...');
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
      console.log('PDF generated successfully, size:', pdfBuffer.length);

    // Save PDF locally
      console.log('Saving PDF to file storage...');
    const result = await this.fileStorageService.saveCertificatePDF(
      Buffer.from(pdfBuffer),
      certificate.certificateNumber,
    );
      console.log('PDF saved successfully:', result.downloadUrl);

    return result.downloadUrl;
    } catch (error) {
      console.error('Error generating certificate PDF:', error);
      throw error;
    }
  }

  async updateCertificateUrl(certificateId: string, certificateUrl: string): Promise<Certificate> {
    return this.prisma.certificate.update({
      where: { id: certificateId },
      data: { certificateUrl },
    }) as Promise<Certificate>;
  }

  private generateCertificateHTML(template: CertificateTemplate): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Certificate of Completion</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:wght@700&family=Roboto:wght@400;700&display=swap');
            body {
              margin: 0;
              padding: 0;
              background: #f6f3e7;
            }
            .certificate-border {
              width: 900px;
              height: 635px;
              margin: 40px auto;
              background: #fff;
              border: 12px solid #d4af37;
              border-radius: 32px;
              box-shadow: 0 8px 32px rgba(44, 62, 80, 0.18);
              position: relative;
              overflow: hidden;
              box-sizing: border-box;
            }
            .certificate-inner {
              position: relative;
              width: 100%;
              height: 100%;
              padding: 48px 60px 32px 60px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              font-family: 'Roboto', Arial, sans-serif;
              z-index: 2;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 400px;
              height: 400px;
              opacity: 0.08;
              background: url('https://upload.wikimedia.org/wikipedia/commons/6/6b/Bitmap_Seal_of_Kenya.png') no-repeat center center;
              background-size: contain;
              z-index: 1;
              pointer-events: none;
            }
            .logo {
              width: 80px;
              height: 80px;
              margin-bottom: 10px;
              background: url('https://upload.wikimedia.org/wikipedia/commons/6/6b/Bitmap_Seal_of_Kenya.png') no-repeat center center;
              background-size: contain;
            }
            .certificate-title {
              font-family: 'Great Vibes', cursive;
              font-size: 54px;
              color: #bfa13a;
              font-weight: 700;
              margin-bottom: 0px;
              letter-spacing: 2px;
              text-shadow: 1px 2px 8px #e6d8a8;
            }
            .divider {
              width: 220px;
              height: 2px;
              background: linear-gradient(90deg, #fff 0%, #d4af37 50%, #fff 100%);
              margin: 18px 0 28px 0;
              border-radius: 2px;
            }
            .subtitle {
              font-size: 22px;
              color: #555;
              margin-bottom: 18px;
              font-weight: 400;
              letter-spacing: 1px;
            }
            .recipient {
              font-size: 34px;
              color: #2c3e50;
              font-weight: 700;
              margin-bottom: 10px;
              font-family: 'Playfair Display', serif;
              letter-spacing: 1px;
            }
            .content {
              font-size: 20px;
              color: #444;
              margin-bottom: 18px;
            }
            .course-name {
              font-size: 26px;
              color: #1a73e8;
              font-weight: 700;
              margin: 10px 0 18px 0;
              font-family: 'Playfair Display', serif;
            }
            .details {
              width: 100%;
              display: flex;
              justify-content: space-between;
              font-size: 15px;
              color: #888;
              margin-bottom: 18px;
            }
            .details div {
              text-align: left;
            }
            .signature-section {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 30px;
            }
            .signature-block {
              text-align: center;
              width: 260px;
            }
            .signature-line {
              border-bottom: 2px solid #bfa13a;
              margin: 0 auto 8px auto;
              width: 200px;
              height: 40px;
            }
            .signature-label {
              font-size: 16px;
              color: #888;
              font-family: 'Great Vibes', cursive;
              font-weight: 700;
            }
            .seal {
              width: 80px;
              height: 80px;
              background: url('https://upload.wikimedia.org/wikipedia/commons/6/6b/Bitmap_Seal_of_Kenya.png') no-repeat center center;
              background-size: contain;
              margin: 0 auto;
            }
            .verification {
              margin-top: 18px;
              font-size: 13px;
              color: #bfa13a;
              text-align: center;
              letter-spacing: 1px;
            }
          </style>
        </head>
        <body>
          <div class="certificate-border">
            <div class="watermark"></div>
            <div class="certificate-inner">
              <div>
                <div class="logo"></div>
                <div class="certificate-title">Certificate of Completion</div>
                <div class="divider"></div>
              <div class="subtitle">This is to certify that</div>
                <div class="recipient">${template.studentName}</div>
            <div class="content">
                  has successfully completed the course
              <div class="course-name">${template.courseName}</div>
                  on <b>${template.completionDate}</b>
            </div>
            <div class="details">
              <div>
                    <strong>Certificate No:</strong><br>${template.certificateNumber}
              </div>
              <div>
                    <strong>Instructor:</strong><br>${template.instructorName}
            </div>
                </div>
              </div>
              <div class="signature-section">
                <div class="signature-block">
                  <div class="signature-line"></div>
                  <div class="signature-label">${template.instructorName}<br>Instructor</div>
                </div>
                <div class="seal"></div>
                <div class="signature-block">
                  <div class="signature-line"></div>
                  <div class="signature-label">Date<br>${template.completionDate}</div>
                </div>
              </div>
            <div class="verification">
              <strong>Verification Code:</strong> ${template.verificationCode}<br>
              This certificate can be verified at our platform.
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private async sendCertificateEmail(certificateId: string): Promise<void> {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    await this.mailService.sendCertificateEmail({
      to: certificate.user.email,
      studentName: certificate.user.name,
      courseName: certificate.course.title,
      certificateUrl: certificate.certificateUrl!,
      certificateNumber: certificate.certificateNumber,
    });
  }
}