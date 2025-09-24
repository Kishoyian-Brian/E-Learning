import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { MaterialType } from '@prisma/client';

export class CreateContentDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsEnum(MaterialType)
  type: MaterialType;

  @IsString()
  url: string;

  @IsString()
  moduleId: string;

  @IsNumber()
  order: number;

  @IsBoolean()
  @IsOptional()
  visible?: boolean;
}
