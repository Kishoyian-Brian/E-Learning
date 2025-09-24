import { IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class UpdateProgressDto {
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsDateString()
  completedAt?: string;
} 