import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  joinDate: Date;
  lastLogin: Date;
  isVerified: boolean;
  profile: StudentProfile;
  preferences: StudentPreferences;
}

export interface StudentProfile {
  bio: string;
  location: string;
  phone: string;
  website?: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  skills: string[];
  interests: string[];
  education: Education[];
  experience: Experience[];
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

export interface StudentPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  courseRecommendations: boolean;
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface StudentEnrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  courseThumbnail: string;
  instructorName: string;
  enrollmentDate: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'SUSPENDED';
  progress: number;
  lastAccessedAt: Date;
  totalStudyTime: number; // in minutes
  certificates: Certificate[];
  assignments: Assignment[];
  grades: Grade[];
}

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  issuedDate: Date;
  certificateUrl: string;
  isVerified: boolean;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  dueDate: Date;
  submittedAt?: Date;
  grade?: number;
  maxPoints: number;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE';
}

export interface Grade {
  id: string;
  courseId: string;
  courseTitle: string;
  assignmentTitle: string;
  grade: number;
  maxPoints: number;
  percentage: number;
  letterGrade: string;
  feedback?: string;
  gradedAt: Date;
}

export interface DashboardStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedCourses: number;
  totalStudyTime: number; // in hours
  averageGrade: number;
  certificatesEarned: number;
  assignmentsCompleted: number;
  assignmentsPending: number;
  currentStreak: number; // days
  totalPoints: number;
}

export interface StudySession {
  id: string;
  courseId: string;
  courseTitle: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  lessonsCompleted: number;
  notes?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: 'COURSE' | 'STUDY' | 'SOCIAL' | 'SPECIAL';
  points: number;
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
}

export interface CourseRecommendation {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructorName: string;
  rating: number;
  totalStudents: number;
  price: number;
  originalPrice?: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  duration: number; // in hours
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentDashboardService {
  private currentStudent: Student = {
    id: 'student-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    joinDate: new Date('2024-01-15'),
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isVerified: true,
    profile: {
      bio: 'Passionate learner interested in web development and design. Always eager to learn new technologies and improve my skills.',
      location: 'New York, NY',
      phone: '+1 (555) 123-4567',
      website: 'https://johndoe.dev',
      socialLinks: {
        twitter: '@johndoe',
        linkedin: 'john-doe-dev',
        github: 'johndoe'
      },
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Python'],
      interests: ['Web Development', 'UI/UX Design', 'Machine Learning', 'Mobile Development'],
      education: [
        {
          id: 'edu-1',
          institution: 'University of Technology',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: new Date('2020-09-01'),
          endDate: new Date('2024-05-15'),
          isCurrent: false
        }
      ],
      experience: [
        {
          id: 'exp-1',
          company: 'Tech Startup',
          position: 'Junior Developer',
          description: 'Developed web applications using React and Node.js',
          startDate: new Date('2023-06-01'),
          isCurrent: true
        }
      ]
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      weeklyDigest: true,
      courseRecommendations: true,
      language: 'en',
      timezone: 'America/New_York',
      theme: 'dark'
    }
  };

  private enrollments: StudentEnrollment[] = [
    {
      id: 'enrollment-1',
      courseId: 'web-dev-101',
      courseTitle: 'Web Development Fundamentals',
      courseThumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop',
      instructorName: 'Sarah Johnson',
      enrollmentDate: new Date('2024-01-20'),
      status: 'ACTIVE',
      progress: 75,
      lastAccessedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      totalStudyTime: 1800, // 30 hours
      certificates: [],
      assignments: [
        {
          id: 'assign-1',
          courseId: 'web-dev-101',
          courseTitle: 'Web Development Fundamentals',
          title: 'Build a Portfolio Website',
          description: 'Create a personal portfolio website using HTML, CSS, and JavaScript',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          maxPoints: 100,
          status: 'PENDING'
        }
      ],
      grades: [
        {
          id: 'grade-1',
          courseId: 'web-dev-101',
          courseTitle: 'Web Development Fundamentals',
          assignmentTitle: 'HTML Basics Quiz',
          grade: 85,
          maxPoints: 100,
          percentage: 85,
          letterGrade: 'B',
          feedback: 'Great work! Consider using more semantic HTML elements.',
          gradedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      ]
    },
    {
      id: 'enrollment-2',
      courseId: 'python-basics',
      courseTitle: 'Python Programming for Beginners',
      courseThumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=300&h=200&fit=crop',
      instructorName: 'Michael Chen',
      enrollmentDate: new Date('2024-02-01'),
      status: 'ACTIVE',
      progress: 45,
      lastAccessedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      totalStudyTime: 1200, // 20 hours
      certificates: [],
      assignments: [
        {
          id: 'assign-2',
          courseId: 'python-basics',
          courseTitle: 'Python Programming for Beginners',
          title: 'Calculator Program',
          description: 'Build a simple calculator using Python functions',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          grade: 92,
          maxPoints: 100,
          status: 'GRADED'
        }
      ],
      grades: [
        {
          id: 'grade-2',
          courseId: 'python-basics',
          courseTitle: 'Python Programming for Beginners',
          assignmentTitle: 'Calculator Program',
          grade: 92,
          maxPoints: 100,
          percentage: 92,
          letterGrade: 'A',
          feedback: 'Excellent work! Your calculator handles all operations correctly.',
          gradedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
        }
      ]
    },
    {
      id: 'enrollment-3',
      courseId: 'ui-ux-design',
      courseTitle: 'UI/UX Design Principles',
      courseThumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop',
      instructorName: 'Emily Davis',
      enrollmentDate: new Date('2023-12-15'),
      status: 'COMPLETED',
      progress: 100,
      lastAccessedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      totalStudyTime: 2400, // 40 hours
      certificates: [
        {
          id: 'cert-1',
          courseId: 'ui-ux-design',
          courseTitle: 'UI/UX Design Principles',
          issuedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          certificateUrl: 'https://example.com/certificates/ui-ux-design.pdf',
          isVerified: true
        }
      ],
      assignments: [],
      grades: [
        {
          id: 'grade-3',
          courseId: 'ui-ux-design',
          courseTitle: 'UI/UX Design Principles',
          assignmentTitle: 'Final Design Project',
          grade: 95,
          maxPoints: 100,
          percentage: 95,
          letterGrade: 'A',
          feedback: 'Outstanding design work! Your attention to detail is impressive.',
          gradedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      ]
    }
  ];

  private studySessions: StudySession[] = [
    {
      id: 'session-1',
      courseId: 'web-dev-101',
      courseTitle: 'Web Development Fundamentals',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      duration: 30,
      lessonsCompleted: 2,
      notes: 'Completed HTML fundamentals and started CSS basics'
    },
    {
      id: 'session-2',
      courseId: 'python-basics',
      courseTitle: 'Python Programming for Beginners',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 23 * 60 * 60 * 1000),
      duration: 60,
      lessonsCompleted: 3,
      notes: 'Learned about functions and completed calculator assignment'
    }
  ];

  private achievements: Achievement[] = [
    {
      id: 'ach-1',
      title: 'First Course Completed',
      description: 'Successfully completed your first course',
      icon: 'fas fa-trophy',
      earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      category: 'COURSE',
      points: 100
    },
    {
      id: 'ach-2',
      title: 'Study Streak',
      description: 'Studied for 7 consecutive days',
      icon: 'fas fa-fire',
      earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      category: 'STUDY',
      points: 50
    },
    {
      id: 'ach-3',
      title: 'Perfect Score',
      description: 'Achieved 100% on an assignment',
      icon: 'fas fa-star',
      earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      category: 'COURSE',
      points: 75
    }
  ];

  private notifications: Notification[] = [
    {
      id: 'notif-1',
      title: 'Assignment Due Soon',
      message: 'Your portfolio website assignment is due in 3 days',
      type: 'WARNING',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      actionUrl: '/assignments',
      courseId: 'web-dev-101'
    },
    {
      id: 'notif-2',
      title: 'Grade Available',
      message: 'Your calculator assignment has been graded',
      type: 'SUCCESS',
      isRead: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      actionUrl: '/grades',
      courseId: 'python-basics'
    },
    {
      id: 'notif-3',
      title: 'New Course Available',
      message: 'Advanced JavaScript course is now available',
      type: 'INFO',
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      actionUrl: '/courses'
    }
  ];

  private courseRecommendations: CourseRecommendation[] = [
    {
      id: 'rec-1',
      title: 'Advanced JavaScript',
      description: 'Master modern JavaScript with ES6+, async programming, and advanced concepts',
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=300&h=200&fit=crop',
      instructorName: 'David Wilson',
      rating: 4.8,
      totalStudents: 15420,
      price: 89.99,
      originalPrice: 129.99,
      level: 'INTERMEDIATE',
      category: 'Programming',
      duration: 15,
      reason: 'Based on your interest in web development'
    },
    {
      id: 'rec-2',
      title: 'React.js Complete Guide',
      description: 'Build modern web applications with React.js and Redux',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop',
      instructorName: 'Sarah Johnson',
      rating: 4.9,
      totalStudents: 23450,
      price: 99.99,
      level: 'INTERMEDIATE',
      category: 'Web Development',
      duration: 20,
      reason: 'Perfect follow-up to your web development course'
    }
  ];

  constructor() {}

  getCurrentStudent(): Observable<Student> {
    return of(this.currentStudent).pipe(delay(300));
  }

  updateStudentProfile(updates: Partial<StudentProfile>): Observable<Student> {
    this.currentStudent.profile = { ...this.currentStudent.profile, ...updates };
    return of(this.currentStudent).pipe(delay(600));
  }

  updateStudentPreferences(updates: Partial<StudentPreferences>): Observable<Student> {
    this.currentStudent.preferences = { ...this.currentStudent.preferences, ...updates };
    return of(this.currentStudent).pipe(delay(400));
  }

  getEnrollments(): Observable<StudentEnrollment[]> {
    return of(this.enrollments).pipe(delay(500));
  }

  getEnrollmentById(id: string): Observable<StudentEnrollment | null> {
    const enrollment = this.enrollments.find(e => e.id === id);
    return of(enrollment || null).pipe(delay(300));
  }

  getActiveEnrollments(): Observable<StudentEnrollment[]> {
    const activeEnrollments = this.enrollments.filter(e => e.status === 'ACTIVE');
    return of(activeEnrollments).pipe(delay(400));
  }

  getCompletedEnrollments(): Observable<StudentEnrollment[]> {
    const completedEnrollments = this.enrollments.filter(e => e.status === 'COMPLETED');
    return of(completedEnrollments).pipe(delay(400));
  }

  updateEnrollmentProgress(enrollmentId: string, progress: number): Observable<StudentEnrollment | null> {
    const enrollment = this.enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) {
      return of(null).pipe(delay(300));
    }

    enrollment.progress = progress;
    enrollment.lastAccessedAt = new Date();

    if (progress === 100 && enrollment.status !== 'COMPLETED') {
      enrollment.status = 'COMPLETED';
    }

    return of(enrollment).pipe(delay(500));
  }

  getDashboardStats(): Observable<DashboardStats> {
    const stats: DashboardStats = {
      totalEnrollments: this.enrollments.length,
      activeEnrollments: this.enrollments.filter(e => e.status === 'ACTIVE').length,
      completedCourses: this.enrollments.filter(e => e.status === 'COMPLETED').length,
      totalStudyTime: Math.round(this.enrollments.reduce((sum, e) => sum + e.totalStudyTime, 0) / 60),
      averageGrade: this.calculateAverageGrade(),
      certificatesEarned: this.enrollments.reduce((sum, e) => sum + e.certificates.length, 0),
      assignmentsCompleted: this.enrollments.reduce((sum, e) => 
        sum + e.assignments.filter(a => a.status === 'GRADED').length, 0),
      assignmentsPending: this.enrollments.reduce((sum, e) => 
        sum + e.assignments.filter(a => a.status === 'PENDING').length, 0),
      currentStreak: this.calculateCurrentStreak(),
      totalPoints: this.achievements.reduce((sum, a) => sum + a.points, 0)
    };

    return of(stats).pipe(delay(400));
  }

  getStudySessions(limit?: number): Observable<StudySession[]> {
    let sessions = [...this.studySessions].sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    if (limit) {
      sessions = sessions.slice(0, limit);
    }

    return of(sessions).pipe(delay(300));
  }

  addStudySession(session: Omit<StudySession, 'id'>): Observable<StudySession> {
    const newSession: StudySession = {
      ...session,
      id: Date.now().toString()
    };

    this.studySessions.push(newSession);
    return of(newSession).pipe(delay(400));
  }

  getAchievements(): Observable<Achievement[]> {
    return of(this.achievements).pipe(delay(300));
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

  markAllNotificationsAsRead(): Observable<void> {
    this.notifications.forEach(n => n.isRead = true);
    return of(void 0).pipe(delay(300));
  }

  getCourseRecommendations(): Observable<CourseRecommendation[]> {
    return of(this.courseRecommendations).pipe(delay(500));
  }

  getAssignments(): Observable<Assignment[]> {
    const allAssignments = this.enrollments.flatMap(e => e.assignments);
    return of(allAssignments).pipe(delay(400));
  }

  getPendingAssignments(): Observable<Assignment[]> {
    const pendingAssignments = this.enrollments
      .flatMap(e => e.assignments)
      .filter(a => a.status === 'PENDING');
    return of(pendingAssignments).pipe(delay(400));
  }

  getGrades(): Observable<Grade[]> {
    const allGrades = this.enrollments.flatMap(e => e.grades);
    return of(allGrades).pipe(delay(400));
  }

  getCertificates(): Observable<Certificate[]> {
    const allCertificates = this.enrollments.flatMap(e => e.certificates);
    return of(allCertificates).pipe(delay(300));
  }

  private calculateAverageGrade(): number {
    const allGrades = this.enrollments.flatMap(e => e.grades);
    if (allGrades.length === 0) return 0;
    
    const totalPercentage = allGrades.reduce((sum, g) => sum + g.percentage, 0);
    return Math.round(totalPercentage / allGrades.length);
  }

  private calculateCurrentStreak(): number {
    // Mock calculation - in real app, this would analyze study sessions
    return 7; // 7 days
  }

  getRecentActivity(): Observable<any[]> {
    const activities = [
      {
        type: 'ENROLLMENT',
        title: 'Enrolled in Python Programming',
        description: 'Started learning Python basics',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        icon: 'fas fa-graduation-cap'
      },
      {
        type: 'ASSIGNMENT',
        title: 'Submitted Calculator Assignment',
        description: 'Completed Python calculator program',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        icon: 'fas fa-upload'
      },
      {
        type: 'ACHIEVEMENT',
        title: 'Earned Study Streak Badge',
        description: 'Studied for 7 consecutive days',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        icon: 'fas fa-fire'
      }
    ];

    return of(activities).pipe(delay(300));
  }
} 