import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BlogService } from '../blog/blog.service';
import { JWTPayloadUser } from 'src/interfaces';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    private readonly blogService: BlogService,
  ) {}

  async createComment(
    blogId: string,
    createCommentDto: CreateCommentDto,
    loginUser: JWTPayloadUser,
  ) {
    const blog = await this.blogService.getBlog(blogId);

    if (String(blog.author._id) === String(loginUser.userId)) {
      throw new BadRequestException('You can not comment your own post.');
    }

    const session = await this.commentModel.startSession();
    session.startTransaction();

    try {
      const createdComment = await this.commentModel.create(
        [{ ...createCommentDto, blog: blog._id, user: loginUser.userId }],
        { session },
      );

      blog.comments = [...(blog.comments || []), createdComment[0]._id];

      await blog.save({ session });

      await session.commitTransaction();
      await session.endSession();
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw error;
    }

    const result = await this.blogService.getBlog(blogId);
    return result;
  }
}
