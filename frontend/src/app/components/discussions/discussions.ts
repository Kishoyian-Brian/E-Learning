import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DiscussionsService, DiscussionPost, CreateDiscussionDto, DiscussionFilters } from '../../services/discussions.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-discussions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './discussions.html',
  styleUrls: ['./discussions.css']
})
export class DiscussionsComponent implements OnInit, OnDestroy {
  @Input() courseId?: string;
  
  discussions: DiscussionPost[] = [];
  loading = false;
  error = '';
  showCreateForm = false;
  createForm: FormGroup;
  filters: DiscussionFilters = {};
  currentUser: any;
  private subscriptions = new Subscription();

  constructor(
    private discussionsService: DiscussionsService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      content: ['', [Validators.required, Validators.maxLength(5000)]],
      category: ['GENERAL']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    
    // Get courseId from route if not provided as input
    if (!this.courseId) {
      this.subscriptions.add(
        this.route.params.subscribe(params => {
          this.courseId = params['courseId'];
          if (this.courseId) {
            this.loadDiscussions();
          }
        })
      );
    } else {
      this.loadDiscussions();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadDiscussions(): void {
    this.loading = true;
    this.error = '';

    let discussionsObservable;
    if (this.courseId) {
      discussionsObservable = this.discussionsService.getDiscussionsByCourse(this.courseId, this.filters);
    } else {
      discussionsObservable = this.discussionsService.getAllDiscussions(this.filters);
    }

    this.subscriptions.add(
      discussionsObservable.subscribe({
        next: (discussions) => {
          this.discussions = discussions;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load discussions';
          this.loading = false;
          console.error('Error loading discussions:', err);
        }
      })
    );
  }

  createDiscussion(): void {
    if (this.createForm.invalid || !this.courseId) return;
    
    const discussionData: CreateDiscussionDto = {
      ...this.createForm.value,
      courseId: this.courseId
    };
    
    this.loading = true;
    this.subscriptions.add(
      this.discussionsService.createDiscussion(discussionData)
        .subscribe({
          next: (discussion) => {
            this.discussions.unshift(discussion);
            this.createForm.reset({ category: 'GENERAL' });
            this.showCreateForm = false;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to create discussion';
            this.loading = false;
            console.error('Error creating discussion:', err);
          }
        })
    );
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.createForm.reset({ category: 'GENERAL' });
    }
  }

  applyFilters(): void {
    this.loadDiscussions();
  }

  clearFilters(): void {
    this.filters = {};
    this.loadDiscussions();
  }

  voteDiscussion(discussion: DiscussionPost, voteType: 'UPVOTE' | 'DOWNVOTE'): void {
    this.subscriptions.add(
      this.discussionsService.voteDiscussion(discussion.id, { voteType })
        .subscribe({
          next: (updatedDiscussion) => {
            const index = this.discussions.findIndex(d => d.id === discussion.id);
            if (index !== -1) {
              this.discussions[index] = updatedDiscussion;
            }
          },
          error: (err) => {
            console.error('Error voting on discussion:', err);
          }
        })
    );
  }

  deleteDiscussion(discussion: DiscussionPost): void {
    if (!confirm('Are you sure you want to delete this discussion?')) return;
    
    this.subscriptions.add(
      this.discussionsService.deleteDiscussion(discussion.id)
        .subscribe({
          next: () => {
            this.discussions = this.discussions.filter(d => d.id !== discussion.id);
          },
          error: (err) => {
            console.error('Error deleting discussion:', err);
          }
        })
    );
  }

  viewDiscussion(discussion: DiscussionPost): void {
    this.router.navigate(['/discussions', discussion.id]);
  }

  getCategoryClass(category: string): string {
    const classes = {
      'GENERAL': 'bg-blue-100 text-blue-800',
      'Q&A': 'bg-green-100 text-green-800',
      'STUDY_TIPS': 'bg-yellow-100 text-yellow-800',
      'RESOURCE': 'bg-purple-100 text-purple-800',
      'CHALLENGE': 'bg-red-100 text-red-800'
    };
    return classes[category as keyof typeof classes] || classes['GENERAL'];
  }

  getCategoryDisplayName(category: string): string {
    const names = {
      'GENERAL': 'General',
      'Q&A': 'Q&A',
      'STUDY_TIPS': 'Study Tips',
      'RESOURCE': 'Resource',
      'CHALLENGE': 'Challenge'
    };
    return names[category as keyof typeof names] || category;
  }

  canDeleteDiscussion(discussion: DiscussionPost): boolean {
    return this.currentUser && (
      this.currentUser.id === discussion.userId ||
      this.currentUser.role === 'ADMIN' ||
      this.currentUser.role === 'INSTRUCTOR'
    );
  }

  canEditDiscussion(discussion: DiscussionPost): boolean {
    return this.currentUser && this.currentUser.id === discussion.userId;
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  }

  hasUserVoted(discussion: DiscussionPost, voteType: 'UPVOTE' | 'DOWNVOTE'): boolean {
    return discussion.votes.some(v => v.userId === this.currentUser?.id && v.voteType === voteType);
  }
} 