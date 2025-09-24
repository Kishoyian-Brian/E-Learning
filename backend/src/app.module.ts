import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { ProgressModule } from './modules/progress/progress.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { DiscussionsModule } from './modules/discussions/discussions.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { MailModule } from './modules/mail/mail.module';
import { ContentModule } from './content/content.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PrismaService } from './shared/prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    CoursesModule,
    EnrollmentModule,
    ProgressModule,
    QuizModule,
    CertificatesModule,
    DiscussionsModule,
    AnalyticsModule,
    MailModule,
    ContentModule,
    CloudinaryModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}


