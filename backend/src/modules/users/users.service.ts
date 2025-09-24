import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserProfile } from './interfaces/user.interface';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findProfile(id: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            enrollments: true,
            courses: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user as UserProfile;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: any): Promise<User> {
    // Check if user is updating their own profile or is admin
    if (currentUser.id !== id && currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // If not admin, prevent role changes
    if (currentUser.role !== Role.ADMIN && updateUserDto.role) {
      delete updateUserDto.role;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async remove(id: string, currentUser: any): Promise<void> {
    // Only admins can delete users
    if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete users');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async getEnrolledCourses(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            category: true,
            difficulty: true,
            _count: {
              select: {
                modules: true,
                enrollments: true,
              },
            },
          },
        },
      },
    });
  }

  async getInstructorCourses(instructorId: string) {
    return this.prisma.course.findMany({
      where: { instructorId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        difficulty: true,
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
    });
  }
} 