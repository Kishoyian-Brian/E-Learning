import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '@prisma/client';

export class CreateQuestionDto {
  @IsString()
  text: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsString()
  answer: string;

  @IsNumber()
  order: number;
}

export class CreateQuizDto {
  @IsString()
  title: string;

  @IsString()
  courseId: string;

  @IsOptional()
  @IsNumber()
  timeLimit?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
} 