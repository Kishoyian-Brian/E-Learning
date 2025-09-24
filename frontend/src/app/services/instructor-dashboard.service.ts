import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  joinDate: Date;
  lastLogin: Date;
  isVerified: boolean;
  isFeatured: boolean;
  profile: InstructorProfile;
  preferences: InstructorPreferences;
  stats: InstructorStats;
}

export interface InstructorProfile {
  bio: string;
  location: string;
  phone: string;
  website: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    youtube?: string;
  };
  expertise: string[];
  education: Education[];
  experience: Experience[];
  certifications: Certification[];
  languages: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialUrl?: string;
}

export interface InstructorPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  studentMessages: boolean;
  courseUpdates: boolean;
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  autoPublish: boolean;
  allowStudentReviews: boolean;
}

export interface InstructorStats {
  totalCourses: number;
  activeCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
  totalLessons: number;
  totalAssignments: number;
  certificatesIssued: number;
}

export interface InstructorCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'REVIEW';
  price: number;
  originalPrice?: number;
  enrollmentCount: number;
  rating: number;
  totalReviews: number;
  completionRate: number;
  revenue: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  lessons: CourseLesson[];
  students: CourseStudent[];
  analytics: CourseAnalytics;
}

export interface CourseLesson {
  id: string;
  title: string;
  type: 'VIDEO' | 'READING' | 'QUIZ' | 'ASSIGNMENT' | 'DISCUSSION';
  duration: number; // in minutes
  order: number;
  isPublished: boolean;
  viewCount: number;
  completionRate: number;
}

export interface CourseStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  enrollmentDate: Date;
  progress: number;
  lastAccessedAt: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  assignments: StudentAssignment[];
  grades: StudentGrade[];
}

export interface StudentAssignment {
  id: string;
  title: string;
  dueDate: Date;
  submittedAt?: Date;
  grade?: number;
  maxPoints: number;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE';
  feedback?: string;
}

export interface StudentGrade {
  id: string;
  assignmentTitle: string;
  grade: number;
  maxPoints: number;
  percentage: number;
  letterGrade: string;
  gradedAt: Date;
}

export interface CourseAnalytics {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  averageProgress: number;
  averageCompletionTime: number; // in days
  studentSatisfaction: number;
  revenueThisMonth: number;
  revenueThisYear: number;
  topPerformingLessons: string[];
  engagementMetrics: EngagementMetrics;
}

export interface EngagementMetrics {
  averageWatchTime: number; // in minutes
  lessonCompletionRate: number;
  assignmentSubmissionRate: number;
  discussionParticipation: number;
  studentRetentionRate: number;
}

export interface DashboardStats {
  totalCourses: number;
  activeCourses: number;
  totalStudents: number;
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
  certificatesIssued: number;
  pendingAssignments: number;
  studentMessages: number;
  courseViews: number;
  enrollmentGrowth: number; // percentage
  revenueGrowth: number; // percentage
}

export interface RevenueData {
  month: string;
  revenue: number;
  enrollments: number;
  courses: number;
}

export interface StudentMessage {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  courseId: string;
  courseTitle: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface PendingAssignment {
  id: string;
  courseId: string;
  courseTitle: string;
  lessonTitle: string;
  studentName: string;
  studentEmail: string;
  assignmentTitle: string;
  submittedAt: Date;
  dueDate: Date;
  isLate: boolean;
  maxPoints: number;
}

export interface CourseReview {
  id: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  studentAvatar: string;
  rating: number;
  review: string;
  createdAt: Date;
  isVerified: boolean;
  helpfulCount: number;
  instructorResponse?: string;
  responseDate?: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  courseId?: string;
  studentId?: string;
}

export interface AnalyticsData {
  enrollments: {
    total: number;
    thisMonth: number;
    thisYear: number;
    growth: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    thisYear: number;
    growth: number;
  };
  students: {
    total: number;
    active: number;
    newThisMonth: number;
    retentionRate: number;
  };
  courses: {
    total: number;
    published: number;
    draft: number;
    averageRating: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class InstructorDashboardService {
  private currentInstructor: Instructor = {
    id: 'instructor-1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    joinDate: new Date('2023-11-20'),
    lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000),
    isVerified: true,
    isFeatured: true,
    profile: {
      bio: 'Experienced web developer and instructor with 10+ years of experience in creating engaging online courses. Passionate about helping students master modern web technologies.',
      location: 'San Francisco, CA',
      phone: '+1 (555) 234-5678',
      website: 'https://sarahjohnson.dev',
      socialLinks: {
        twitter: '@sarahjohnson',
        linkedin: 'sarah-johnson-dev',
        github: 'sarahjohnson',
        youtube: '@sarahjohnson'
      },
      expertise: ['Web Development', 'JavaScript', 'React', 'Node.js', 'Python', 'UI/UX Design'],
      education: [
        {
          id: 'edu-1',
          institution: 'Stanford University',
          degree: 'Master of Science',
          field: 'Computer Science',
          startDate: new Date('2018-09-01'),
          endDate: new Date('2020-06-15'),
          isCurrent: false
        }
      ],
      experience: [
        {
          id: 'exp-1',
          company: 'TechCorp',
          position: 'Senior Developer',
          description: 'Led development of multiple web applications and mentored junior developers',
          startDate: new Date('2020-07-01'),
          isCurrent: true
        }
      ],
      certifications: [
        {
          id: 'cert-1',
          name: 'AWS Certified Developer',
          issuingOrganization: 'Amazon Web Services',
          issueDate: new Date('2022-03-15'),
          credentialUrl: 'https://aws.amazon.com/certification/'
        }
      ],
      languages: ['English', 'Spanish']
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      studentMessages: true,
      courseUpdates: true,
      language: 'en',
      timezone: 'America/Los_Angeles',
      theme: 'dark',
      autoPublish: false,
      allowStudentReviews: true
    },
    stats: {
      totalCourses: 15,
      activeCourses: 12,
      totalStudents: 15420,
      totalRevenue: 125000,
      averageRating: 4.8,
      totalReviews: 2847,
      completionRate: 78,
      totalLessons: 450,
      totalAssignments: 180,
      certificatesIssued: 12450
    }
  };

  private courses: InstructorCourse[] = [
    {
      id: 'web-dev-101',
      title: 'Web Development Fundamentals',
      description: 'Learn the basics of HTML, CSS, and JavaScript to build modern websites',
      thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop',
      category: 'Web Development',
      level: 'BEGINNER',
      status: 'PUBLISHED',
      price: 89.99,
      originalPrice: 129.99,
      enrollmentCount: 5420,
      rating: 4.8,
      totalReviews: 847,
      completionRate: 82,
      revenue: 487580,
      createdAt: new Date('2023-12-01'),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      publishedAt: new Date('2023-12-15'),
      lessons: [
        {
          id: 'lesson-1',
          title: 'Introduction to HTML',
          type: 'VIDEO',
          duration: 45,
          order: 1,
          isPublished: true,
          viewCount: 5420,
          completionRate: 95
        },
        {
          id: 'lesson-2',
          title: 'CSS Styling Basics',
          type: 'VIDEO',
          duration: 60,
          order: 2,
          isPublished: true,
          viewCount: 4980,
          completionRate: 88
        }
      ],
      students: [
        {
          id: 'student-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
          enrollmentDate: new Date('2024-01-20'),
          progress: 75,
          lastAccessedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'ACTIVE',
          assignments: [
            {
              id: 'assign-1',
              title: 'Build a Portfolio Website',
              dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
              maxPoints: 100,
              status: 'PENDING'
            }
          ],
          grades: [
            {
              id: 'grade-1',
              assignmentTitle: 'HTML Basics Quiz',
              grade: 85,
              maxPoints: 100,
              percentage: 85,
              letterGrade: 'B',
              gradedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            }
          ]
        }
      ],
      analytics: {
        totalEnrollments: 5420,
        activeEnrollments: 4230,
        completedEnrollments: 4444,
        averageProgress: 78,
        averageCompletionTime: 45,
        studentSatisfaction: 4.8,
        revenueThisMonth: 45000,
        revenueThisYear: 487580,
        topPerformingLessons: ['Introduction to HTML', 'CSS Styling Basics'],
        engagementMetrics: {
          averageWatchTime: 42,
          lessonCompletionRate: 88,
          assignmentSubmissionRate: 75,
          discussionParticipation: 65,
          studentRetentionRate: 82
        }
      }
    },
    {
      id: 'react-masterclass',
      title: 'React.js Masterclass',
      description: 'Master React.js with hooks, context, and advanced patterns',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop',
      category: 'Web Development',
      level: 'INTERMEDIATE',
      status: 'PUBLISHED',
      price: 129.99,
      enrollmentCount: 3240,
      rating: 4.9,
      totalReviews: 623,
      completionRate: 85,
      revenue: 421560,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      publishedAt: new Date('2024-02-01'),
      lessons: [
        {
          id: 'lesson-3',
          title: 'React Fundamentals',
          type: 'VIDEO',
          duration: 90,
          order: 1,
          isPublished: true,
          viewCount: 3240,
          completionRate: 92
        }
      ],
      students: [],
      analytics: {
        totalEnrollments: 3240,
        activeEnrollments: 2754,
        completedEnrollments: 2754,
        averageProgress: 85,
        averageCompletionTime: 60,
        studentSatisfaction: 4.9,
        revenueThisMonth: 35000,
        revenueThisYear: 421560,
        topPerformingLessons: ['React Fundamentals'],
        engagementMetrics: {
          averageWatchTime: 78,
          lessonCompletionRate: 92,
          assignmentSubmissionRate: 88,
          discussionParticipation: 72,
          studentRetentionRate: 85
        }
      }
    }
  ];

  private studentMessages: StudentMessage[] = [
    {
      id: 'msg-1',
      studentId: 'student-1',
      studentName: 'John Doe',
      studentAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      courseId: 'web-dev-101',
      courseTitle: 'Web Development Fundamentals',
      subject: 'Question about CSS Grid',
      message: 'Hi Sarah, I\'m having trouble understanding CSS Grid layout. Could you explain the difference between grid-template-columns and grid-template-rows?',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      priority: 'MEDIUM'
    },
    {
      id: 'msg-2',
      studentId: 'student-2',
      studentName: 'Emily Chen',
      studentAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      courseId: 'react-masterclass',
      courseTitle: 'React.js Masterclass',
      subject: 'Assignment Submission Issue',
      message: 'I\'m trying to submit my React project but the upload keeps failing. Can you help me troubleshoot this?',
      isRead: false,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      priority: 'HIGH'
    }
  ];

  private pendingAssignments: PendingAssignment[] = [
    {
      id: 'pending-1',
      courseId: 'web-dev-101',
      courseTitle: 'Web Development Fundamentals',
      lessonTitle: 'CSS Layouts',
      studentName: 'John Doe',
      studentEmail: 'john.doe@example.com',
      assignmentTitle: 'Responsive Navigation Bar',
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      isLate: false,
      maxPoints: 100
    },
    {
      id: 'pending-2',
      courseId: 'react-masterclass',
      courseTitle: 'React.js Masterclass',
      lessonTitle: 'State Management',
      studentName: 'Emily Chen',
      studentEmail: 'emily.chen@example.com',
      assignmentTitle: 'Todo App with Context',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      isLate: true,
      maxPoints: 150
    }
  ];

  private courseReviews: CourseReview[] = [
    {
      id: 'review-1',
      courseId: 'web-dev-101',
      courseTitle: 'Web Development Fundamentals',
      studentName: 'John Doe',
      studentAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      rating: 5,
      review: 'Excellent course! Sarah explains complex concepts in a very clear and engaging way. The hands-on projects really helped me understand the material.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isVerified: true,
      helpfulCount: 12,
      instructorResponse: 'Thank you John! I\'m glad you found the course helpful. Keep up the great work!',
      responseDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    }
  ];

  private notifications: Notification[] = [
    {
      id: 'notif-1',
      title: 'New Student Enrollment',
      message: 'John Doe enrolled in your React.js Masterclass course',
      type: 'SUCCESS',
      isRead: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      actionUrl: '/courses/react-masterclass',
      courseId: 'react-masterclass',
      studentId: 'student-1'
    },
    {
      id: 'notif-2',
      title: 'Assignment Submitted',
      message: 'Emily Chen submitted her Todo App assignment',
      type: 'INFO',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      actionUrl: '/assignments',
      courseId: 'react-masterclass',
      studentId: 'student-2'
    }
  ];

  constructor() {}

  getCurrentInstructor(): Observable<Instructor> {
    return of(this.currentInstructor).pipe(delay(300));
  }

  updateInstructorProfile(updates: Partial<InstructorProfile>): Observable<Instructor> {
    this.currentInstructor.profile = { ...this.currentInstructor.profile, ...updates };
    return of(this.currentInstructor).pipe(delay(600));
  }

  updateInstructorPreferences(updates: Partial<InstructorPreferences>): Observable<Instructor> {
    this.currentInstructor.preferences = { ...this.currentInstructor.preferences, ...updates };
    return of(this.currentInstructor).pipe(delay(400));
  }

  getCourses(): Observable<InstructorCourse[]> {
    return of(this.courses).pipe(delay(500));
  }

  getCourseById(id: string): Observable<InstructorCourse | null> {
    const course = this.courses.find(c => c.id === id);
    return of(course || null).pipe(delay(300));
  }

  getActiveCourses(): Observable<InstructorCourse[]> {
    const activeCourses = this.courses.filter(c => c.status === 'PUBLISHED');
    return of(activeCourses).pipe(delay(400));
  }

  getDraftCourses(): Observable<InstructorCourse[]> {
    const draftCourses = this.courses.filter(c => c.status === 'DRAFT');
    return of(draftCourses).pipe(delay(400));
  }

  createCourse(courseData: Omit<InstructorCourse, 'id' | 'createdAt' | 'updatedAt' | 'analytics'>): Observable<InstructorCourse> {
    const newCourse: InstructorCourse = {
      ...courseData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      analytics: {
        totalEnrollments: 0,
        activeEnrollments: 0,
        completedEnrollments: 0,
        averageProgress: 0,
        averageCompletionTime: 0,
        studentSatisfaction: 0,
        revenueThisMonth: 0,
        revenueThisYear: 0,
        topPerformingLessons: [],
        engagementMetrics: {
          averageWatchTime: 0,
          lessonCompletionRate: 0,
          assignmentSubmissionRate: 0,
          discussionParticipation: 0,
          studentRetentionRate: 0
        }
      }
    };
    
    this.courses.push(newCourse);
    return of(newCourse).pipe(delay(800));
  }

  updateCourse(id: string, updates: Partial<InstructorCourse>): Observable<InstructorCourse | null> {
    const courseIndex = this.courses.findIndex(c => c.id === id);
    if (courseIndex === -1) {
      return of(null).pipe(delay(300));
    }

    this.courses[courseIndex] = { 
      ...this.courses[courseIndex], 
      ...updates, 
      updatedAt: new Date() 
    };
    return of(this.courses[courseIndex]).pipe(delay(600));
  }

  publishCourse(id: string): Observable<InstructorCourse | null> {
    return this.updateCourse(id, { 
      status: 'PUBLISHED', 
      publishedAt: new Date() 
    });
  }

  getDashboardStats(): Observable<DashboardStats> {
    const stats: DashboardStats = {
      totalCourses: this.courses.length,
      activeCourses: this.courses.filter(c => c.status === 'PUBLISHED').length,
      totalStudents: this.courses.reduce((sum, c) => sum + c.enrollmentCount, 0),
      totalRevenue: this.courses.reduce((sum, c) => sum + c.revenue, 0),
      monthlyRevenue: this.courses.reduce((sum, c) => sum + c.analytics.revenueThisMonth, 0),
      yearlyRevenue: this.courses.reduce((sum, c) => sum + c.analytics.revenueThisYear, 0),
      averageRating: this.calculateAverageRating(),
      totalReviews: this.courses.reduce((sum, c) => sum + c.totalReviews, 0),
      completionRate: this.calculateAverageCompletionRate(),
      certificatesIssued: this.currentInstructor.stats.certificatesIssued,
      pendingAssignments: this.pendingAssignments.length,
      studentMessages: this.studentMessages.filter(m => !m.isRead).length,
      courseViews: this.courses.reduce((sum, c) => sum + c.lessons.reduce((lSum, l) => lSum + l.viewCount, 0), 0),
      enrollmentGrowth: 15, // Mock percentage
      revenueGrowth: 23 // Mock percentage
    };

    return of(stats).pipe(delay(400));
  }

  getStudentMessages(): Observable<StudentMessage[]> {
    return of(this.studentMessages).pipe(delay(300));
  }

  getUnreadMessages(): Observable<StudentMessage[]> {
    const unreadMessages = this.studentMessages.filter(m => !m.isRead);
    return of(unreadMessages).pipe(delay(300));
  }

  markMessageAsRead(id: string): Observable<void> {
    const message = this.studentMessages.find(m => m.id === id);
    if (message) {
      message.isRead = true;
    }
    return of(void 0).pipe(delay(200));
  }

  getPendingAssignments(): Observable<PendingAssignment[]> {
    return of(this.pendingAssignments).pipe(delay(400));
  }

  gradeAssignment(assignmentId: string, grade: number, feedback?: string): Observable<void> {
    // Simulate grading process
    const assignment = this.pendingAssignments.find(a => a.id === assignmentId);
    if (assignment) {
      // Remove from pending and add to graded
      this.pendingAssignments = this.pendingAssignments.filter(a => a.id !== assignmentId);
    }
    return of(void 0).pipe(delay(600));
  }

  getCourseReviews(): Observable<CourseReview[]> {
    return of(this.courseReviews).pipe(delay(300));
  }

  respondToReview(reviewId: string, response: string): Observable<CourseReview | null> {
    const review = this.courseReviews.find(r => r.id === reviewId);
    if (review) {
      review.instructorResponse = response;
      review.responseDate = new Date();
    }
    return of(review || null).pipe(delay(400));
  }

  getNotifications(): Observable<Notification[]> {
    return of(this.notifications).pipe(delay(300));
  }

  getUnreadNotifications(): Observable<Notification[]> {
    const unreadNotifications = this.notifications.filter(n => !n.isRead);
    return of(unreadNotifications).pipe(delay(300));
  }

  markNotificationAsRead(id: string): Observable<void> {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
    }
    return of(void 0).pipe(delay(200));
  }

  getRevenueData(): Observable<RevenueData[]> {
    const revenueData: RevenueData[] = [
      { month: 'Jan', revenue: 45000, enrollments: 450, courses: 12 },
      { month: 'Feb', revenue: 52000, enrollments: 520, courses: 12 },
      { month: 'Mar', revenue: 48000, enrollments: 480, courses: 13 },
      { month: 'Apr', revenue: 55000, enrollments: 550, courses: 13 },
      { month: 'May', revenue: 60000, enrollments: 600, courses: 14 },
      { month: 'Jun', revenue: 65000, enrollments: 650, courses: 14 }
    ];
    return of(revenueData).pipe(delay(400));
  }

  getAnalyticsData(): Observable<AnalyticsData> {
    const analytics: AnalyticsData = {
      enrollments: {
        total: this.courses.reduce((sum, c) => sum + c.enrollmentCount, 0),
        thisMonth: 1200,
        thisYear: 15420,
        growth: 15
      },
      revenue: {
        total: this.courses.reduce((sum, c) => sum + c.revenue, 0),
        thisMonth: 45000,
        thisYear: 125000,
        growth: 23
      },
      students: {
        total: this.courses.reduce((sum, c) => sum + c.enrollmentCount, 0),
        active: this.courses.reduce((sum, c) => sum + c.analytics.activeEnrollments, 0),
        newThisMonth: 1200,
        retentionRate: 78
      },
      courses: {
        total: this.courses.length,
        published: this.courses.filter(c => c.status === 'PUBLISHED').length,
        draft: this.courses.filter(c => c.status === 'DRAFT').length,
        averageRating: this.calculateAverageRating()
      }
    };
    return of(analytics).pipe(delay(500));
  }

  private calculateAverageRating(): number {
    if (this.courses.length === 0) return 0;
    const totalRating = this.courses.reduce((sum, c) => sum + c.rating, 0);
    return Math.round((totalRating / this.courses.length) * 10) / 10;
  }

  private calculateAverageCompletionRate(): number {
    if (this.courses.length === 0) return 0;
    const totalCompletionRate = this.courses.reduce((sum, c) => sum + c.completionRate, 0);
    return Math.round(totalCompletionRate / this.courses.length);
  }
} 