export interface DiscussionPost {
  id: string;
  userId: string;
  courseId: string;
  title: string;
  content: string;
  category: DiscussionCategory;
  isResolved: boolean;
  isPinned: boolean;
  isLocked: boolean;
  upvotes: number;
  downvotes: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  course?: Course;
  replies?: DiscussionReply[];
  votes?: DiscussionVote[];
}

export interface DiscussionReply {
  id: string;
  postId: string;
  userId: string;
  content: string;
  isAccepted: boolean;
  isInstructorReply: boolean;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  post?: DiscussionPost;
  votes?: DiscussionReplyVote[];
}

export interface DiscussionVote {
  id: string;
  discussionId: string;
  userId: string;
  voteType: VoteType;
  createdAt: Date;
  discussion?: DiscussionPost;
  user?: User;
}

export interface DiscussionReplyVote {
  id: string;
  replyId: string;
  userId: string;
  voteType: VoteType;
  createdAt: Date;
  reply?: DiscussionReply;
  user?: User;
}

export interface DiscussionWithDetails extends DiscussionPost {
  user: User;
  course: Course;
  replies: DiscussionReplyWithUser[];
  replyCount: number;
  lastReplyAt?: Date;
}

export interface DiscussionReplyWithUser extends DiscussionReply {
  user: User;
}

export interface CreateDiscussionDto {
  courseId: string;
  title: string;
  content: string;
  category?: DiscussionCategory;
}

export interface UpdateDiscussionDto {
  title?: string;
  content?: string;
  category?: DiscussionCategory;
  isResolved?: boolean;
  isPinned?: boolean;
  isLocked?: boolean;
}

export interface CreateReplyDto {
  content: string;
}

export interface UpdateReplyDto {
  content: string;
}

export interface VoteDto {
  voteType: VoteType;
}

export interface DiscussionFilters {
  category?: DiscussionCategory;
  isResolved?: boolean;
  isPinned?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'upvotes' | 'replyCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface DiscussionStats {
  totalDiscussions: number;
  totalReplies: number;
  resolvedDiscussions: number;
  activeDiscussions: number;
  topCategories: { category: DiscussionCategory; count: number }[];
}

export type DiscussionCategory = 'GENERAL' | 'Q&A' | 'STUDY_TIPS' | 'RESOURCE' | 'CHALLENGE';
export type VoteType = 'UPVOTE' | 'DOWNVOTE';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
} 