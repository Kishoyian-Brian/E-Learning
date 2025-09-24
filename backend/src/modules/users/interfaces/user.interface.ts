import { Role } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  _count: {
    enrollments: number;
    courses: number;
    reviews: number;
  };
} 