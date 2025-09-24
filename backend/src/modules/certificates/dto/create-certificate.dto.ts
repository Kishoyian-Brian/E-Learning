import {
  IsString,
  IsEnum,
  IsOptional,
  IsDate,
  IsObject,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCertificateDto {
  @IsString()
  userId: string;

  @IsString()
  courseId: string;

  @IsString()
  enrollmentId: string;

  @IsEnum(['COMPLETION', 'ACHIEVEMENT', 'PARTICIPATION'])
  type: 'COMPLETION' | 'ACHIEVEMENT' | 'PARTICIPATION';

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  expiresAt?: Date | null;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
