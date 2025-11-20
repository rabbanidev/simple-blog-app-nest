import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/core/auth/auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import type { AuthRequest } from 'src/interfaces';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @Post('/:blogId/create')
  async createComment(
    @Param('blogId') blogId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: AuthRequest,
  ) {
    const result = await this.commentService.createComment(
      blogId,
      createCommentDto,
      req.user,
    );
    return { message: 'Comment create successfully', data: result };
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @Post('/:blogId/update/:commentId')
  async updateComment(
    @Param('blogId') blogId: string,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: AuthRequest,
  ) {
    const result = await this.commentService.updateComment(
      blogId,
      commentId,
      updateCommentDto,
      req.user,
    );
    return { message: 'Comment update successfully', data: result };
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @Delete('/:blogId/delete/:commentId')
  async deleteComment(
    @Param('blogId') blogId: string,
    @Param('commentId') commentId: string,
    @Req() req: AuthRequest,
  ) {
    await this.commentService.deleteComment(blogId, commentId, req.user);
    return { message: 'Comment deleted successfully' };
  }
}
