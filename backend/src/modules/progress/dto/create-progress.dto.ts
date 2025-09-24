import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateProgressDto {
  @IsString()
  @IsNotEmpty()
  enrollmentId: string;

  @IsString()
  @IsNotEmpty()
  moduleId: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
} 