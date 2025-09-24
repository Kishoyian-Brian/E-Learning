import { PartialType } from '@nestjs/mapped-types';
import { CreateQuizDto } from './create-quiz.dto';
import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdateQuizDto extends PartialType(CreateQuizDto) {
} 