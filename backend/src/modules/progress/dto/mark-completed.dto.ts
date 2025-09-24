import { IsOptional, IsBoolean, IsString } from 'class-validator';

export class MarkCompletedDto {
  @IsOptional()
  @IsBoolean()
  forceComplete?: boolean; // Allow admin/instructor to force complete

  @IsOptional()
  @IsString()
  completionReason?: string; // Track why it was marked complete

  @IsOptional()
  @IsBoolean()
  skipValidation?: boolean; // Skip validation checks
} 