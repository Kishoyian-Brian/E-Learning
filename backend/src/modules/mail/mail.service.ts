import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendVerificationEmail(email: string, code: string, name: string) {
    console.log(
      `📧 Sending verification email to: ${email} with code: ${code}`,
    );

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify Your Email - E-Learning Platform',
        template: 'email-verification',
        context: {
          name,
          verificationUrl: code, // This will be the 6-digit code
        },
      });
      console.log(`✅ Verification email sent successfully to: ${email}`);
    } catch (error) {
      console.error(
        `❌ Failed to send verification email to ${email}:`,
        error.message,
      );
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string, name: string) {
    console.log(`📧 Sending password reset email to: ${email}`);

    const resetUrl = `${this.configService.get<string>('CORS_ORIGINS')}/reset-password?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset Request - E-Learning Platform',
        template: 'password-reset',
        context: {
          name,
          resetUrl,
          token,
        },
      });
      console.log(`✅ Password reset email sent successfully to: ${email}`);
    } catch (error) {
      console.error(
        `❌ Failed to send password reset email to ${email}:`,
        error.message,
      );
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string) {
    console.log(`📧 Sending welcome email to: ${email}`);

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to E-Learning Platform',
        template: 'welcome',
        context: {
          name,
        },
      });
      console.log(`✅ Welcome email sent successfully to: ${email}`);
    } catch (error) {
      console.error(
        `❌ Failed to send welcome email to ${email}:`,
        error.message,
      );
      throw error;
    }
  }

  async sendCertificateEmail(data: {
    to: string;
    studentName: string;
    courseName: string;
    certificateUrl: string;
    certificateNumber: string;
  }) {
    console.log(`📧 Sending certificate email to: ${data.to}`);

    try {
      await this.mailerService.sendMail({
        to: data.to,
        subject: 'Your Certificate of Completion - E-Learning Platform',
        template: 'certificate',
        context: {
          studentName: data.studentName,
          courseName: data.courseName,
          certificateUrl: data.certificateUrl,
          certificateNumber: data.certificateNumber,
          completionDate: new Date().toLocaleDateString(),
        },
      });
      console.log(`✅ Certificate email sent successfully to: ${data.to}`);
    } catch (error) {
      console.error(
        `❌ Failed to send certificate email to ${data.to}:`,
        error.message,
      );
      // Don't throw error - certificate generation should continue even if email fails
      console.log(`⚠️ Certificate generation continuing despite email failure`);
    }
  }

  async sendCourseEnrollmentEmail(data: {
    to: string;
    studentName: string;
    courseName: string;
    instructorName: string;
  }) {
    console.log(`📧 Sending course enrollment email to: ${data.to}`);

    try {
      await this.mailerService.sendMail({
        to: data.to,
        subject: `Welcome to ${data.courseName} - E-Learning Platform`,
        template: 'course-enrollment',
        context: {
          studentName: data.studentName,
          courseName: data.courseName,
          instructorName: data.instructorName,
          enrollmentDate: new Date().toLocaleDateString(),
        },
      });
      console.log(`✅ Course enrollment email sent successfully to: ${data.to}`);
    } catch (error) {
      console.error(
        `❌ Failed to send course enrollment email to ${data.to}:`,
        error.message,
      );
      // Don't throw error - enrollment should continue even if email fails
      console.log(`⚠️ Course enrollment continuing despite email failure`);
    }
  }

  async sendDiscussionNotificationEmail(data: {
    to: string;
    recipientName: string;
    discussionTitle: string;
    courseName: string;
    authorName: string;
    discussionUrl: string;
  }) {
    console.log(`📧 Sending discussion notification email to: ${data.to}`);

    try {
      await this.mailerService.sendMail({
        to: data.to,
        subject: `New Discussion: ${data.discussionTitle} - ${data.courseName}`,
        template: 'discussion-notification',
        context: {
          recipientName: data.recipientName,
          discussionTitle: data.discussionTitle,
          courseName: data.courseName,
          authorName: data.authorName,
          discussionUrl: data.discussionUrl,
          notificationDate: new Date().toLocaleDateString(),
        },
      });
      console.log(`✅ Discussion notification email sent successfully to: ${data.to}`);
    } catch (error) {
      console.error(
        `❌ Failed to send discussion notification email to ${data.to}:`,
        error.message,
      );
      throw error;
    }
  }

  async sendReplyNotificationEmail(data: {
    to: string;
    recipientName: string;
    discussionTitle: string;
    courseName: string;
    authorName: string;
    discussionUrl: string;
  }) {
    console.log(`📧 Sending reply notification email to: ${data.to}`);

    try {
      await this.mailerService.sendMail({
        to: data.to,
        subject: `New Reply: ${data.discussionTitle} - ${data.courseName}`,
        template: 'reply-notification',
        context: {
          recipientName: data.recipientName,
          discussionTitle: data.discussionTitle,
          courseName: data.courseName,
          authorName: data.authorName,
          discussionUrl: data.discussionUrl,
          notificationDate: new Date().toLocaleDateString(),
        },
      });
      console.log(`✅ Reply notification email sent successfully to: ${data.to}`);
    } catch (error) {
      console.error(
        `❌ Failed to send reply notification email to ${data.to}:`,
        error.message,
      );
      throw error;
    }
  }

  async sendAdminNotificationEmail(data: {
    subject: string;
    message: string;
    eventType: string;
    details?: any;
  }) {
    const adminEmail = 'maxmillianmuiruri@gmail.com';
    console.log(`📧 Sending admin notification email to: ${adminEmail}`);

    try {
      await this.mailerService.sendMail({
        to: adminEmail,
        subject: `Admin Notification: ${data.subject}`,
        template: 'admin-notification',
        context: {
          subject: data.subject,
          message: data.message,
          eventType: data.eventType,
          details: data.details,
          notificationDate: new Date().toLocaleDateString(),
          notificationTime: new Date().toLocaleTimeString(),
        },
      });
      console.log(`✅ Admin notification email sent successfully to: ${adminEmail}`);
    } catch (error) {
      console.error(
        `❌ Failed to send admin notification email to ${adminEmail}:`,
        error.message,
      );
      // Don't throw error - admin notifications are not critical for core functionality
      console.log(`⚠️ Admin notification failed but continuing process`);
    }
  }

  async sendCourseCompletionNotificationEmail(data: {
    to: string;
    studentName: string;
    courseName: string;
    instructorName: string;
    completionDate: Date;
  }) {
    console.log(`📧 Sending course completion notification email to: ${data.to}`);

    try {
      await this.mailerService.sendMail({
        to: data.to,
        subject: `Congratulations! You've completed ${data.courseName}`,
        template: 'course-completion',
        context: {
          studentName: data.studentName,
          courseName: data.courseName,
          instructorName: data.instructorName,
          completionDate: data.completionDate.toLocaleDateString(),
        },
      });
      console.log(`✅ Course completion notification email sent successfully to: ${data.to}`);
    } catch (error) {
      console.error(
        `❌ Failed to send course completion notification email to ${data.to}:`,
        error.message,
      );
      throw error;
    }
  }
} 