import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  DiscussionWithDetails,
  CreateDiscussionDto,
  UpdateDiscussionDto,
  CreateReplyDto,
  VoteDto,
  DiscussionFilters,
  DiscussionStats,
  DiscussionCategory,
  VoteType,
} from './interfaces/discussion.interface';

@Injectable()
export class DiscussionsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async createDiscussion(
    createDiscussionDto: CreateDiscussionDto,
    userId: string,
  ): Promise<DiscussionWithDetails> {
    // Verify user is enrolled in the course
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        courseId: createDiscussionDto.courseId,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('You must be enrolled in this course to create discussions');
    }

    const discussion = await this.prisma.discussionPost.create({
      data: {
        userId,
        courseId: createDiscussionDto.courseId,
        title: createDiscussionDto.title,
        content: createDiscussionDto.content,
        category: createDiscussionDto.category || 'GENERAL',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    // Send notification emails to other enrolled students
    try {
      const enrolledStudents = await this.prisma.enrollment.findMany({
        where: {
          courseId: createDiscussionDto.courseId,
          userId: { not: userId }, // Exclude the author
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      for (const enrollment of enrolledStudents) {
        try {
          await this.mailService.sendDiscussionNotificationEmail({
            to: enrollment.user.email,
            recipientName: enrollment.user.name,
            discussionTitle: createDiscussionDto.title,
            courseName: discussion.course.title,
            authorName: discussion.user.name,
            discussionUrl: `/discussions/${discussion.id}`,
          });
        } catch (error) {
          console.error(
            `Failed to send discussion notification to ${enrollment.user.email}:`,
            error instanceof Error ? error.message : 'Unknown error',
          );
        }
      }
    } catch (error) {
      console.error('Failed to send discussion notifications:', error instanceof Error ? error.message : 'Unknown error');
    }

    return this.formatDiscussionWithDetails(discussion);
  }

  async findAll(filters: DiscussionFilters = {}): Promise<DiscussionWithDetails[]> {
    const where: any = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.isResolved !== undefined) {
      where.isResolved = filters.isResolved;
    }

    if (filters.isPinned !== undefined) {
      where.isPinned = filters.isPinned;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const discussions = await this.prisma.discussionPost.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: filters.page ? (filters.page - 1) * (filters.limit || 10) : 0,
      take: filters.limit || 10,
    });

    return discussions.map(discussion => this.formatDiscussionWithDetails(discussion));
  }

  async findByCourse(
    courseId: string,
    filters: DiscussionFilters = {},
  ): Promise<DiscussionWithDetails[]> {
    const where: any = { courseId };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.isResolved !== undefined) {
      where.isResolved = filters.isResolved;
    }

    if (filters.isPinned !== undefined) {
      where.isPinned = filters.isPinned;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const discussions = await this.prisma.discussionPost.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: filters.page ? (filters.page - 1) * (filters.limit || 10) : 0,
      take: filters.limit || 10,
    });

    return discussions.map(discussion => this.formatDiscussionWithDetails(discussion));
  }

  async findOne(id: string): Promise<DiscussionWithDetails> {
    const discussion = await this.prisma.discussionPost.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    // Increment view count
    await this.prisma.discussionPost.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return this.formatDiscussionWithDetails(discussion);
  }

  async updateDiscussion(
    id: string,
    updateDiscussionDto: UpdateDiscussionDto,
    userId: string,
  ): Promise<DiscussionWithDetails> {
    const discussion = await this.prisma.discussionPost.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    // Only author or instructor can update
    if (discussion.userId !== userId && discussion.user.role !== 'INSTRUCTOR') {
      throw new ForbiddenException('You can only update your own discussions');
    }

    const updatedDiscussion = await this.prisma.discussionPost.update({
      where: { id },
      data: updateDiscussionDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return this.formatDiscussionWithDetails(updatedDiscussion);
  }

  async deleteDiscussion(id: string, userId: string): Promise<void> {
    const discussion = await this.prisma.discussionPost.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    // Only author or instructor can delete
    if (discussion.userId !== userId && discussion.user.role !== 'INSTRUCTOR') {
      throw new ForbiddenException('You can only delete your own discussions');
    }

    await this.prisma.discussionPost.delete({
      where: { id },
    });
  }

  async createReply(
    discussionId: string,
    createReplyDto: CreateReplyDto,
    userId: string,
  ): Promise<any> {
    // Verify discussion exists
    const discussion = await this.prisma.discussionPost.findUnique({
      where: { id: discussionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    if (discussion.isLocked) {
      throw new ForbiddenException('This discussion is locked');
    }

    // Verify user is enrolled in the course
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        courseId: discussion.courseId,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('You must be enrolled in this course to reply');
    }

    // Check if user is instructor
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const reply = await this.prisma.discussionReply.create({
      data: {
        postId: discussionId,
        userId,
        content: createReplyDto.content,
        isInstructorReply: user?.role === 'INSTRUCTOR',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Send notification email to discussion author (if not the same person)
    if (discussion.userId !== userId) {
      try {
        await this.mailService.sendReplyNotificationEmail({
          to: discussion.user.email,
          recipientName: discussion.user.name,
          discussionTitle: discussion.title,
          courseName: discussion.course.title,
          authorName: reply.user.name,
          discussionUrl: `/discussions/${discussionId}`,
        });
      } catch (error) {
        console.error(
          'Failed to send reply notification email:',
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
    }

    return reply;
  }

  async updateReply(
    replyId: string,
    updateReplyDto: CreateReplyDto,
    userId: string,
  ): Promise<any> {
    const reply = await this.prisma.discussionReply.findUnique({
      where: { id: replyId },
      include: { user: true },
    });

    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    // Only author can update
    if (reply.userId !== userId) {
      throw new ForbiddenException('You can only update your own replies');
    }

    return this.prisma.discussionReply.update({
      where: { id: replyId },
      data: updateReplyDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async deleteReply(replyId: string, userId: string): Promise<void> {
    const reply = await this.prisma.discussionReply.findUnique({
      where: { id: replyId },
      include: { user: true },
    });

    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    // Only author or instructor can delete
    if (reply.userId !== userId && reply.user.role !== 'INSTRUCTOR') {
      throw new ForbiddenException('You can only delete your own replies');
    }

    await this.prisma.discussionReply.delete({
      where: { id: replyId },
    });
  }

  async voteDiscussion(
    discussionId: string,
    voteDto: VoteDto,
    userId: string,
  ): Promise<any> {
    const discussion = await this.prisma.discussionPost.findUnique({
      where: { id: discussionId },
    });

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    // Check if user already voted
    const existingVote = await this.prisma.discussionVote.findUnique({
      where: {
        discussionId_userId: {
          discussionId,
          userId,
        },
      },
    });

    if (existingVote) {
      if (existingVote.voteType === voteDto.voteType) {
        // Remove vote if same type
        await this.prisma.discussionVote.delete({
          where: { id: existingVote.id },
        });

        // Update vote counts
        const voteChange = voteDto.voteType === 'UPVOTE' ? -1 : 1;
        await this.prisma.discussionPost.update({
          where: { id: discussionId },
          data: {
            upvotes: { increment: voteDto.voteType === 'UPVOTE' ? -1 : 0 },
            downvotes: { increment: voteDto.voteType === 'DOWNVOTE' ? -1 : 0 },
          },
        });

        return { message: 'Vote removed' };
      } else {
        // Change vote
        await this.prisma.discussionVote.update({
          where: { id: existingVote.id },
          data: { voteType: voteDto.voteType },
        });

        // Update vote counts
        await this.prisma.discussionPost.update({
          where: { id: discussionId },
          data: {
            upvotes: { increment: voteDto.voteType === 'UPVOTE' ? 1 : -1 },
            downvotes: { increment: voteDto.voteType === 'DOWNVOTE' ? 1 : -1 },
          },
        });

        return { message: 'Vote updated' };
      }
    } else {
      // Create new vote
      await this.prisma.discussionVote.create({
        data: {
          discussionId,
          userId,
          voteType: voteDto.voteType,
        },
      });

      // Update vote counts
      await this.prisma.discussionPost.update({
        where: { id: discussionId },
        data: {
          upvotes: { increment: voteDto.voteType === 'UPVOTE' ? 1 : 0 },
          downvotes: { increment: voteDto.voteType === 'DOWNVOTE' ? 1 : 0 },
        },
      });

      return { message: 'Vote added' };
    }
  }

  async voteReply(
    replyId: string,
    voteDto: VoteDto,
    userId: string,
  ): Promise<any> {
    const reply = await this.prisma.discussionReply.findUnique({
      where: { id: replyId },
    });

    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    // Check if user already voted
    const existingVote = await this.prisma.discussionReplyVote.findUnique({
      where: {
        replyId_userId: {
          replyId,
          userId,
        },
      },
    });

    if (existingVote) {
      if (existingVote.voteType === voteDto.voteType) {
        // Remove vote if same type
        await this.prisma.discussionReplyVote.delete({
          where: { id: existingVote.id },
        });

        // Update vote counts
        await this.prisma.discussionReply.update({
          where: { id: replyId },
          data: {
            upvotes: { increment: voteDto.voteType === 'UPVOTE' ? -1 : 0 },
            downvotes: { increment: voteDto.voteType === 'DOWNVOTE' ? -1 : 0 },
          },
        });

        return { message: 'Vote removed' };
      } else {
        // Change vote
        await this.prisma.discussionReplyVote.update({
          where: { id: existingVote.id },
          data: { voteType: voteDto.voteType },
        });

        // Update vote counts
        await this.prisma.discussionReply.update({
          where: { id: replyId },
          data: {
            upvotes: { increment: voteDto.voteType === 'UPVOTE' ? 1 : -1 },
            downvotes: { increment: voteDto.voteType === 'DOWNVOTE' ? 1 : -1 },
          },
        });

        return { message: 'Vote updated' };
      }
    } else {
      // Create new vote
      await this.prisma.discussionReplyVote.create({
        data: {
          replyId,
          userId,
          voteType: voteDto.voteType,
        },
      });

      // Update vote counts
      await this.prisma.discussionReply.update({
        where: { id: replyId },
        data: {
          upvotes: { increment: voteDto.voteType === 'UPVOTE' ? 1 : 0 },
          downvotes: { increment: voteDto.voteType === 'DOWNVOTE' ? 1 : 0 },
        },
      });

      return { message: 'Vote added' };
    }
  }

  async acceptReply(replyId: string, userId: string): Promise<any> {
    const reply = await this.prisma.discussionReply.findUnique({
      where: { id: replyId },
      include: {
        post: {
          include: { user: true },
        },
      },
    });

    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    // Only discussion author or instructor can accept replies
    if (reply.post.userId !== userId && reply.post.user.role !== 'INSTRUCTOR') {
      throw new ForbiddenException('Only the discussion author or instructor can accept replies');
    }

    return this.prisma.discussionReply.update({
      where: { id: replyId },
      data: { isAccepted: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async getDiscussionStats(courseId?: string): Promise<DiscussionStats> {
    const where = courseId ? { courseId } : {};

    const [totalDiscussions, totalReplies, resolvedDiscussions, activeDiscussions, topCategories] =
      await Promise.all([
        this.prisma.discussionPost.count({ where }),
        this.prisma.discussionReply.count({
          where: {
            post: where,
          },
        }),
        this.prisma.discussionPost.count({
          where: { ...where, isResolved: true },
        }),
        this.prisma.discussionPost.count({
          where: { ...where, isResolved: false },
        }),
        this.prisma.discussionPost.groupBy({
          by: ['category'],
          where,
          _count: {
            category: true,
          },
          orderBy: {
            _count: {
              category: 'desc',
            },
          },
          take: 5,
        }),
      ]);

    return {
      totalDiscussions,
      totalReplies,
      resolvedDiscussions,
      activeDiscussions,
      topCategories: topCategories.map(cat => ({
        category: cat.category as DiscussionCategory,
        count: cat._count.category,
      })),
    };
  }

  private formatDiscussionWithDetails(discussion: any): DiscussionWithDetails {
    const replyCount = discussion.replies.length;
    const lastReply = discussion.replies[replyCount - 1];

    return {
      ...discussion,
      replyCount,
      lastReplyAt: lastReply?.createdAt,
    };
  }
} 