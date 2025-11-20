import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/core/auth/auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import type { AuthRequest } from 'src/interfaces';

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
}
