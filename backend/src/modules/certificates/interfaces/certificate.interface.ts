export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  enrollmentId: string;
  certificateNumber: string;
  issuedAt: Date;
  expiresAt?: Date | null;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  certificateUrl?: string | null;
  verificationCode: string;
  type: 'COMPLETION' | 'ACHIEVEMENT' | 'PARTICIPATION';
  metadata?: Record<string, any> | null;
}

export interface CertificateWithDetails extends Certificate {
  user: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
    description: string;
  };
  enrollment: {
    id: string;
    enrolledAt: Date;
  };
}

export interface CreateCertificateDto {
  userId: string;
  courseId: string;
  enrollmentId: string;
  type: 'COMPLETION' | 'ACHIEVEMENT' | 'PARTICIPATION';
  expiresAt?: Date | null;
  metadata?: Record<string, any>;
}

export interface CertificateVerificationResult {
  isValid: boolean;
  certificate?: CertificateWithDetails;
  reason?: string;
}

export interface CertificateTemplate {
  studentName: string;
  courseName: string;
  completionDate: string;
  instructorName: string;
  certificateNumber: string;
  verificationCode: string;
  courseDuration?: string;
  courseCredits?: number;
} 