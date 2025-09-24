import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { MaterialType } from '@prisma/client';

export class UpdateContentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsEnum(MaterialType)
  type?: MaterialType;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  moduleId?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}
