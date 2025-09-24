import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength } from 'class-validator';

export enum DiscussionCategory {
  GENERAL = 'GENERAL',
  Q_AND_A = 'Q&A',
  STUDY_TIPS = 'STUDY_TIPS',
  RESOURCE = 'RESOURCE',
  CHALLENGE = 'CHALLENGE',
}

export class CreateDiscussionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;

  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsOptional()
  @IsEnum(DiscussionCategory)
  category?: DiscussionCategory = DiscussionCategory.GENERAL;
} 