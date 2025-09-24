import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssignmentsService, Assignment, AssignmentSubmission, AssignmentStats, AssignmentFilters } from '../../services/assignments.service';

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assignments.html',
  styleUrl: './assignments.css'
})
export class AssignmentsComponent implements OnInit {
  assignments: Assignment[] = [];
  submissions: AssignmentSubmission[] = [];
  stats: AssignmentStats | null = null;
  loading = true;
  selectedTab = 'instructor';
  selectedAssignment: Assignment | null = null;
  selectedSubmission: AssignmentSubmission | null = null;
  isCreatingAssignment = false;
  isEditingAssignment = false;
  isTakingAssignment = false;
  isGradingSubmission = false;
  searchTerm = '';
  selectedStatus = 'all';
  selectedCourse = 'all';
  currentQuestionIndex = 0;
  studentAnswers: { [questionId: string]: any } = {};
  timeRemaining: number = 0;
  timerInterval: any;

  // Form data for creating/editing assignments
  assignmentForm = {
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    points: 100,
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'SUBMITTED' | 'GRADED' | 'LATE',
    submissionType: 'FILE' as 'FILE' | 'TEXT' | 'LINK' | 'MULTIPLE',
    instructions: ''
  };

  // Form data for questions
  questionForm = {
    questionText: '',
    questionType: 'MULTIPLE_CHOICE' as const,
    points: 10,
    options: [
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false }
    ],
    correctAnswer: '',
    rubric: ''
  };

  constructor(private assignmentsService: AssignmentsService) {}

  ngOnInit(): void {
    this.loadAssignmentData();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadAssignmentData(): void {
    this.loading = true;
    
    // Load assignments
    this.assignmentsService.getAssignments().subscribe({
      next: (assignments) => {
        this.assignments = assignments;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading assignments:', error);
        this.assignments = [];
        this.loading = false;
      }
    });

    // Load assignment stats
    this.assignmentsService.getAssignmentStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading assignment stats:', error);
      }
    });
  }

  switchTab(tab: string): void {
    this.selectedTab = tab;
    this.resetForms();
  }

  resetForms(): void {
    this.isCreatingAssignment = false;
    this.isEditingAssignment = false;
    this.isTakingAssignment = false;
    this.isGradingSubmission = false;
    this.selectedAssignment = null;
    this.selectedSubmission = null;
    this.currentQuestionIndex = 0;
    this.studentAnswers = {};
  }

  onStatusChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.assignmentForm.status = target.checked ? 'PUBLISHED' : 'DRAFT';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'IN_PROGRESS':
        return 'text-blue-500 bg-blue-100';
      case 'SUBMITTED':
        return 'text-yellow-500 bg-yellow-100';
      case 'GRADED':
        return 'text-green-500 bg-green-100';
      case 'LATE':
        return 'text-red-500 bg-red-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'IN_PROGRESS':
        return 'fas fa-clock';
      case 'SUBMITTED':
        return 'fas fa-paper-plane';
      case 'GRADED':
        return 'fas fa-check-circle';
      case 'LATE':
        return 'fas fa-exclamation-triangle';
      default:
        return 'fas fa-question-circle';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  getTimeRemaining(dueDate: Date): string {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    
    if (diff <= 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  }

  getTimeRemainingColor(dueDate: Date): string {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    
    if (diff <= 0) return 'text-red-500';
    if (diff <= 24 * 60 * 60 * 1000) return 'text-yellow-500';
    if (diff <= 7 * 24 * 60 * 60 * 1000) return 'text-orange-500';
    return 'text-green-500';
  }

  createAssignment(): void {
    this.isCreatingAssignment = true;
    this.resetAssignmentForm();
  }

  editAssignment(assignment: Assignment): void {
    this.selectedAssignment = assignment;
    this.isEditingAssignment = true;
    this.assignmentForm = {
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.courseId,
      dueDate: assignment.dueDate.toISOString().split('T')[0],
      points: assignment.points,
      status: assignment.status,
      submissionType: assignment.submissionType,
      instructions: assignment.instructions
    };
  }

  saveAssignment(): void {
    // TODO: Implement assignment saving
    console.log('Saving assignment:', this.assignmentForm);
    this.isCreatingAssignment = false;
    this.isEditingAssignment = false;
  }

  deleteAssignment(assignment: Assignment): void {
    if (confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
      // TODO: Implement assignment deletion
      console.log('Deleting assignment:', assignment.id);
    }
  }

  publishAssignment(assignment: Assignment): void {
    // TODO: Implement assignment publishing
    console.log('Publishing assignment:', assignment.id);
  }

  unpublishAssignment(assignment: Assignment): void {
    // TODO: Implement assignment unpublishing
    console.log('Unpublishing assignment:', assignment.id);
  }

  viewSubmissions(assignment: Assignment): void {
    this.selectedAssignment = assignment;
    // TODO: Load submissions for this assignment
  }

  takeAssignment(assignment: Assignment): void {
    this.selectedAssignment = assignment;
    this.isTakingAssignment = true;
    this.currentQuestionIndex = 0;
    this.studentAnswers = {};
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        this.submitAssignment();
      }
    }, 60000); // Update every minute
  }

  // Remove duplicate method - this is handled by the new submitAssignment method below

  gradeSubmission(submission: AssignmentSubmission): void {
    this.selectedSubmission = submission;
    this.isGradingSubmission = true;
  }

  saveGrades(): void {
    // TODO: Implement grade saving
    console.log('Saving grades for submission:', this.selectedSubmission?.id);
    this.isGradingSubmission = false;
  }

  autoGradeSubmission(submission: AssignmentSubmission): void {
    // TODO: Implement auto-grading
    console.log('Auto-grading submission:', submission.id);
  }

  addQuestion(): void {
    // TODO: Implement question addition
    console.log('Adding question:', this.questionForm);
  }

  // Assignment submission methods
  submitAssignment(): void {
    if (this.selectedAssignment) {
      const submission = {
        text: this.studentAnswers['text'],
        link: this.studentAnswers['link'],
        files: [] // TODO: Handle file uploads
      };
      
      this.assignmentsService.submitAssignment(this.selectedAssignment.id, submission).subscribe({
        next: (result) => {
          console.log('Assignment submitted:', result);
          this.resetForms();
        },
        error: (error) => {
          console.error('Error submitting assignment:', error);
        }
      });
    }
  }

  getFilteredAssignments(): Assignment[] {
    let filtered = this.assignments;

    if (this.searchTerm) {
      filtered = filtered.filter(assignment => 
        assignment.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        assignment.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        assignment.courseTitle.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(assignment => {
        if (this.selectedStatus === 'published') return assignment.status === 'PUBLISHED';
        if (this.selectedStatus === 'draft') return assignment.status === 'DRAFT';
        return true;
      });
    }

    if (this.selectedCourse !== 'all') {
      filtered = filtered.filter(assignment => assignment.courseId === this.selectedCourse);
    }

    return filtered;
  }

  getPublishedAssignments(): Assignment[] {
    return this.assignments.filter(assignment => assignment.status === 'PUBLISHED');
  }

  getDraftAssignments(): Assignment[] {
    return this.assignments.filter(assignment => assignment.status === 'DRAFT');
  }

  getSubmissionsForAssignment(assignmentId: string): AssignmentSubmission[] {
    // TODO: Load submissions from service
    return [];
  }

  getPendingGrading(): AssignmentSubmission[] {
    // TODO: Load pending submissions from service
    return [];
  }

  resetAssignmentForm(): void {
    this.assignmentForm = {
      title: '',
      description: '',
      courseId: '',
      dueDate: '',
      points: 100,
      status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'SUBMITTED' | 'GRADED' | 'LATE',
      submissionType: 'FILE' as 'FILE' | 'TEXT' | 'LINK' | 'MULTIPLE',
      instructions: ''
    };
  }

  resetQuestionForm(): void {
    this.questionForm = {
      questionText: '',
      questionType: 'MULTIPLE_CHOICE',
      points: 10,
      options: [
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false }
      ],
      correctAnswer: '',
      rubric: ''
    };
  }

  getGradeColor(grade: string): string {
    const gradeNum = parseFloat(grade);
    if (gradeNum >= 90) return 'text-green-500';
    if (gradeNum >= 80) return 'text-blue-500';
    if (gradeNum >= 70) return 'text-yellow-500';
    if (gradeNum >= 60) return 'text-orange-500';
    return 'text-red-500';
  }

  getScorePercentage(score: number, totalPoints: number): number {
    return (score / totalPoints) * 100;
  }

  getAssignmentById(assignmentId: string): Assignment | undefined {
    return this.assignments.find(assignment => assignment.id === assignmentId);
  }

  viewSubmission(submission: AssignmentSubmission): void {
    this.selectedSubmission = submission;
    // TODO: Implement submission viewing
    console.log('Viewing submission:', submission.id);
  }
}
