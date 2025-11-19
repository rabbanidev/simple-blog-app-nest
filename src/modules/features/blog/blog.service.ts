import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { Model, Types } from 'mongoose';
import { CreateBlogDto } from './dto/create-blo.dto';
import { JWTPayloadUser } from 'src/interfaces';
import { UserService } from 'src/modules/core/user/user.service';
import { IBlog } from './interfaces/blog.interface';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: Model<BlogDocument>,
    private readonly userService: UserService,
  ) {}

  async createBlog(
    createBlogDto: CreateBlogDto,
    loginUser: JWTPayloadUser,
  ): Promise<IBlog> {
    const user = await this.userService.findById(loginUser.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let id: string | Types.ObjectId;

    const session = await this.blogModel.startSession();
    session.startTransaction();

    try {
      const createdBlog = await this.blogModel.create(
        [
          {
            ...createBlogDto,
            author: loginUser.userId,
          },
        ],
        { session },
      );

      user.posts = [...(user.posts || []), createdBlog[0]._id];
      await user.save({ session });

      await session.commitTransaction();
      await session.endSession();

      id = createdBlog[0]._id;
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw error;
    }

    const result = await this.blogModel.findById(id).lean<IBlog>();
    if (!result) {
      throw new NotFoundException('Blog not found');
    }
    return result;
  }
}
