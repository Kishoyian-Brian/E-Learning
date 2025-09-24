import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface DiscussionPost {
  id: string;
  userId: string;
  courseId: string;
  title: string;
  content: string;
  category: string;
  isResolved: boolean;
  isPinned: boolean;
  isLocked: boolean;
  upvotes: number;
  downvotes: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  replies: DiscussionReply[];
  votes: DiscussionVote[];
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
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  votes: DiscussionReplyVote[];
}

export interface DiscussionVote {
  id: string;
  discussionId: string;
  userId: string;
  voteType: string;
  createdAt: string;
}

export interface DiscussionReplyVote {
  id: string;
  replyId: string;
  userId: string;
  voteType: string;
  createdAt: string;
}

export interface CreateDiscussionDto {
  title: string;
  content: string;
  courseId: string;
  category?: string;
}

export interface CreateReplyDto {
  content: string;
}

export interface UpdateDiscussionDto {
  title?: string;
  content?: string;
  category?: string;
}

export interface VoteDto {
  voteType: 'UPVOTE' | 'DOWNVOTE';
}

export interface DiscussionFilters {
  category?: string;
  isResolved?: boolean;
  isPinned?: boolean;
  sortBy?: 'createdAt' | 'upvotes' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

export interface DiscussionStats {
  totalDiscussions: number;
  totalReplies: number;
  resolvedDiscussions: number;
  pinnedDiscussions: number;
  topCategories: Array<{ category: string; count: number }>;
}

@Injectable({
  providedIn: 'root'
})
export class DiscussionsService {
  private apiUrl = 'http://localhost:3000/discussions';
  private discussionsSubject = new BehaviorSubject<DiscussionPost[]>([]);
  public discussions$ = this.discussionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Create a new discussion
  createDiscussion(discussion: CreateDiscussionDto): Observable<DiscussionPost> {
    return this.http.post<DiscussionPost>(this.apiUrl, discussion, { headers: this.getHeaders() });
  }

  // Get all discussions with optional filters
  getAllDiscussions(filters?: DiscussionFilters): Observable<DiscussionPost[]> {
    let params = '';
    if (filters) {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      params = queryParams.toString();
    }
    
    const url = params ? `${this.apiUrl}?${params}` : this.apiUrl;
    return this.http.get<DiscussionPost[]>(url, { headers: this.getHeaders() });
  }

  // Get discussions by course
  getDiscussionsByCourse(courseId: string, filters?: DiscussionFilters): Observable<DiscussionPost[]> {
    let params = '';
    if (filters) {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      params = queryParams.toString();
    }
    
    const url = params ? `${this.apiUrl}/course/${courseId}?${params}` : `${this.apiUrl}/course/${courseId}`;
    return this.http.get<DiscussionPost[]>(url, { headers: this.getHeaders() });
  }

  // Get a specific discussion
  getDiscussion(id: string): Observable<DiscussionPost> {
    return this.http.get<DiscussionPost>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Update a discussion
  updateDiscussion(id: string, discussion: UpdateDiscussionDto): Observable<DiscussionPost> {
    return this.http.patch<DiscussionPost>(`${this.apiUrl}/${id}`, discussion, { headers: this.getHeaders() });
  }

  // Delete a discussion
  deleteDiscussion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Create a reply to a discussion
  createReply(discussionId: string, reply: CreateReplyDto): Observable<DiscussionReply> {
    return this.http.post<DiscussionReply>(`${this.apiUrl}/${discussionId}/replies`, reply, { headers: this.getHeaders() });
  }

  // Update a reply
  updateReply(replyId: string, reply: CreateReplyDto): Observable<DiscussionReply> {
    return this.http.patch<DiscussionReply>(`${this.apiUrl}/replies/${replyId}`, reply, { headers: this.getHeaders() });
  }

  // Delete a reply
  deleteReply(replyId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/replies/${replyId}`, { headers: this.getHeaders() });
  }

  // Vote on a discussion
  voteDiscussion(discussionId: string, vote: VoteDto): Observable<DiscussionPost> {
    return this.http.post<DiscussionPost>(`${this.apiUrl}/${discussionId}/vote`, vote, { headers: this.getHeaders() });
  }

  // Vote on a reply
  voteReply(replyId: string, vote: VoteDto): Observable<DiscussionReply> {
    return this.http.post<DiscussionReply>(`${this.apiUrl}/replies/${replyId}/vote`, vote, { headers: this.getHeaders() });
  }

  // Accept a reply (instructor only)
  acceptReply(replyId: string): Observable<DiscussionReply> {
    return this.http.post<DiscussionReply>(`${this.apiUrl}/replies/${replyId}/accept`, {}, { headers: this.getHeaders() });
  }

  // Get discussion statistics
  getDiscussionStats(courseId?: string): Observable<DiscussionStats> {
    const url = courseId ? `${this.apiUrl}/stats?courseId=${courseId}` : `${this.apiUrl}/stats`;
    return this.http.get<DiscussionStats>(url, { headers: this.getHeaders() });
  }

  // Update local discussions
  updateDiscussions(discussions: DiscussionPost[]): void {
    this.discussionsSubject.next(discussions);
  }

  // Add a new discussion to local state
  addDiscussion(discussion: DiscussionPost): void {
    const current = this.discussionsSubject.value;
    this.discussionsSubject.next([discussion, ...current]);
  }

  // Update a discussion in local state
  updateDiscussionInState(updatedDiscussion: DiscussionPost): void {
    const current = this.discussionsSubject.value;
    const updated = current.map(d => d.id === updatedDiscussion.id ? updatedDiscussion : d);
    this.discussionsSubject.next(updated);
  }

  // Remove a discussion from local state
  removeDiscussionFromState(discussionId: string): void {
    const current = this.discussionsSubject.value;
    const filtered = current.filter(d => d.id !== discussionId);
    this.discussionsSubject.next(filtered);
  }
} 