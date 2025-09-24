import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { VoteDto } from './dto/vote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    role: string;
  };
}

@Controller('discussions')
@UseGuards(JwtAuthGuard)
export class DiscussionsController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @Post()
  async create(@Body() createDiscussionDto: CreateDiscussionDto, @Request() req: RequestWithUser) {
    return this.discussionsService.createDiscussion(createDiscussionDto, req.user.sub);
  }

  @Get()
  async findAll(@Query() filters: any) {
    return this.discussionsService.findAll(filters);
  }

  @Get('course/:courseId')
  async findByCourse(@Param('courseId') courseId: string, @Query() filters: any) {
    return this.discussionsService.findByCourse(courseId, filters);
  }

  @Get('stats')
  async getStats(@Query('courseId') courseId?: string) {
    return this.discussionsService.getDiscussionStats(courseId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.discussionsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDiscussionDto: UpdateDiscussionDto,
    @Request() req: RequestWithUser,
  ) {
    return this.discussionsService.updateDiscussion(id, updateDiscussionDto, req.user.sub);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.discussionsService.deleteDiscussion(id, req.user.sub);
  }

  @Post(':id/replies')
  async createReply(
    @Param('id') discussionId: string,
    @Body() createReplyDto: CreateReplyDto,
    @Request() req: RequestWithUser,
  ) {
    return this.discussionsService.createReply(discussionId, createReplyDto, req.user.sub);
  }

  @Patch('replies/:replyId')
  async updateReply(
    @Param('replyId') replyId: string,
    @Body() updateReplyDto: CreateReplyDto,
    @Request() req: RequestWithUser,
  ) {
    return this.discussionsService.updateReply(replyId, updateReplyDto, req.user.sub);
  }

  @Delete('replies/:replyId')
  async deleteReply(@Param('replyId') replyId: string, @Request() req: RequestWithUser) {
    return this.discussionsService.deleteReply(replyId, req.user.sub);
  }

  @Post(':id/vote')
  async voteDiscussion(
    @Param('id') discussionId: string,
    @Body() voteDto: VoteDto,
    @Request() req: RequestWithUser,
  ) {
    return this.discussionsService.voteDiscussion(discussionId, voteDto, req.user.sub);
  }

  @Post('replies/:replyId/vote')
  async voteReply(
    @Param('replyId') replyId: string,
    @Body() voteDto: VoteDto,
    @Request() req: RequestWithUser,
  ) {
    return this.discussionsService.voteReply(replyId, voteDto, req.user.sub);
  }

  @Post('replies/:replyId/accept')
  @UseGuards(RolesGuard)
  @Roles(Role.INSTRUCTOR)
  async acceptReply(@Param('replyId') replyId: string, @Request() req: RequestWithUser) {
    return this.discussionsService.acceptReply(replyId, req.user.sub);
  }
} 