import { IsEnum, IsNotEmpty } from 'class-validator';

export enum VoteType {
  UPVOTE = 'UPVOTE',
  DOWNVOTE = 'DOWNVOTE',
}

export class VoteDto {
  @IsEnum(VoteType)
  @IsNotEmpty()
  voteType: VoteType;
} 