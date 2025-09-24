import { IsString, IsOptional, IsEnum, IsBoolean, MaxLength } from 'class-validator';
import { DiscussionCategory } from './create-discussion.dto';

export class UpdateDiscussionDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @IsOptional()
  @IsEnum(DiscussionCategory)
  category?: DiscussionCategory;

  @IsOptional()
  @IsBoolean()
  isResolved?: boolean;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;
} 