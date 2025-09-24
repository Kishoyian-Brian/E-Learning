import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateReplyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
} 