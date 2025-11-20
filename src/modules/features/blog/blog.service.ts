import { UpdateBlogDto } from './dto/update-blog.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { Model, Types } from 'mongoose';
import { CreateBlogDto } from './dto/create-blog.dto';
import {
  IPaginationMeta,
  IPaginationOptions,
  JWTPayloadUser,
} from 'src/interfaces';
import { UserService } from 'src/modules/core/user/user.service';
import { IBlog } from './interfaces/blog.interface';
import { GetBlogsDto } from './dto/get-blog.dto';
import { PaginationHelper } from 'src/shared/helpers/pagination.helper';

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

    const result = await this.blogModel
      .findById(id)
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .populate('author', 'name email')
      .lean<IBlog>();
    if (!result) {
      throw new NotFoundException('Blog not found');
    }
    return result;
  }

  async updateBlog(
    id: string,
    updateBlogDto: UpdateBlogDto,
    loginUser: JWTPayloadUser,
  ) {
    const result = await this.blogModel
      .findOneAndUpdate(
        {
          _id: id,
          author: loginUser.userId,
        },
        updateBlogDto,
        { new: true },
      )
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .populate('author', 'name email');
    if (!result) throw new NotFoundException('Blog not found');

    return result;
  }

  async deleteBlog(id: string, loginUser: JWTPayloadUser): Promise<void> {
    const blog = await this.blogModel.findOne({
      _id: id,
      author: loginUser.userId,
    });
    if (!blog) throw new NotFoundException('Blog not found');

    const user = await this.userService.findById(loginUser.userId);

    const newPosts = user.posts.filter((postId) => String(postId) !== id);
    user.posts = newPosts;

    const session = await this.blogModel.startSession();
    session.startTransaction();

    try {
      await this.blogModel.findByIdAndDelete(id, { session });

      await user.save({ session });

      await session.commitTransaction();
      await session.endSession();
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw error;
    }
  }

  async getBlogs(
    filters: Partial<GetBlogsDto>,
    paginationOptions: IPaginationOptions,
  ): Promise<{
    data: Blog[];
    meta: IPaginationMeta;
  }> {
    const { page, limit, skip, sortConditions } =
      PaginationHelper.calculatePagination(paginationOptions);

    const condition = {};
    if (filters.author) {
      condition['author'] = filters.author;
    }
    if (filters.search) {
      condition['title'] = { $regex: filters.search, $options: 'i' }; // TODO: Only search blog title
    }

    const [data, totalRecords] = await Promise.all([
      this.blogModel
        .find(condition)
        .populate({
          path: 'comments',
          populate: {
            path: 'user',
            select: 'name email',
          },
        })
        .populate('author', 'name email')
        .sort(sortConditions)
        .skip(skip)
        .limit(limit)
        .lean(),

      this.blogModel.countDocuments(condition),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  async getBlog(id: string) {
    const result = await this.blogModel
      .findById(id)
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .populate('author', 'name email');

    if (!result) throw new NotFoundException('Blog not found');

    return result;
  }

  async getMyBlogs(loginUser: JWTPayloadUser): Promise<Blog[]> {
    const result = await this.blogModel
      .find({ author: loginUser.userId })
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .populate('author', 'name email')
      .lean();

    return result;
  }

  // async blogFindById(id: string) {
  //   try {
  //     const result = await this.blogModel
  //       .findById(id)
  //       .populate('author', 'name email')
  //       .lean();

  //     if (!result) throw new NotFoundException('Blog not found');

  //     return result;
  //   } catch (error: unknown) {
  //     if (error instanceof NotFoundException) {
  //       throw new NotFoundException('Blog not found');
  //     }
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //     if ((error as any)?.name === 'CastError') {
  //       throw new BadRequestException('Invalid blog ID format');
  //     }

  //     // Optional: other unknown errors
  //     throw new InternalServerErrorException('Internal Server Error');
  //   }
  // }
}
