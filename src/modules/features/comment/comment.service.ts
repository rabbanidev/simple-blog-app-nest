import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BlogService } from '../blog/blog.service';
import { JWTPayloadUser } from 'src/interfaces';
import { UpdateCommentDto } from './dto/update-comment.dto';

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

  async updateComment(
    blogId: string,
    commentId: string,
    updateCommentDto: UpdateCommentDto,
    loginUser: JWTPayloadUser,
  ) {
    const updatedComment = await this.commentModel.findOneAndUpdate(
      {
        _id: commentId,
        user: loginUser.userId,
      },
      updateCommentDto,
    );

    if (!updatedComment) {
      throw new NotFoundException('Comment not found');
    }

    const result = await this.blogService.getBlog(blogId);
    return result;
  }

  async deleteComment(
    blogId: string,
    commentId: string,
    loginUser: JWTPayloadUser,
  ) {
    const comment = await this.commentModel.findOne({
      _id: commentId,
      user: loginUser.userId,
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const blog = await this.blogService.getBlog(blogId);

    const newComments = blog.comments.filter(
      (c) => String(c._id) !== String(commentId),
    );
    blog.comments = newComments;

    const session = await this.commentModel.startSession();
    session.startTransaction();

    try {
      await this.commentModel.findByIdAndDelete(commentId, { session });

      await blog.save({ session });

      await session.commitTransaction();
      await session.endSession();
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw error;
    }
  }
}
