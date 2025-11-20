import { Injectable, NotFoundException } from '@nestjs/common';
import { IUser } from './interfaces/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { UserRole } from 'src/enum';
import { JWTPayloadUser } from 'src/interfaces';
import { IBlog } from 'src/modules/features/blog/interfaces/blog.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createNewUser(user: IUser & { password: string }): Promise<IUser> {
    const createdUser = await this.userModel.create({
      ...user,
      role: UserRole.User,
    });
    const createdUserObj = createdUser.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = createdUserObj;
    return rest;
  }

  async findByEmail(
    email: string,
  ): Promise<
    | (IUser & { password: string; role: UserRole; refreshTokens: string[] })
    | null
  > {
    return await this.userModel.findOne(
      { email },
      { email: 1, password: 1, role: 1, refreshTokens: 1 },
    );
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id, {
      refreshTokens: 0,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async storeRefreshToken(id: string, token: string): Promise<void> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // TODO: Initialize refreshTokens array if undefined
    user.refreshTokens = user.refreshTokens ?? [];

    // TODO: Keep maximum 10 refresh tokens
    if (user.refreshTokens.length >= 10) {
      user.refreshTokens.shift();
    }

    user.refreshTokens.push(token);

    await user.save();
  }

  async getMyProfile(loginUser: JWTPayloadUser): Promise<IUser> {
    const result = await this.userModel
      .findById(loginUser.userId, {
        refreshTokens: 0,
        posts: 0,
      })
      .lean();

    if (!result) {
      throw new NotFoundException('User not found');
    }

    return result;
  }

  async getMyPosts(loginUser: JWTPayloadUser): Promise<IBlog[]> {
    const result = await this.userModel
      .findById(loginUser.userId, {
        posts: 1,
      })
      .populate({
        path: 'posts',
        populate: {
          path: 'comments',
          select: 'content user',
          populate: {
            path: 'user',
            select: 'email name',
          },
        },
      });

    if (!result) {
      throw new NotFoundException('User not found');
    }

    return result.posts as unknown as IBlog[];
  }

  async getUserDetails(id: string): Promise<IUser> {
    const result = await this.userModel
      .findById(id, {
        refreshTokens: 0,
      })
      .populate({
        path: 'posts',
        populate: {
          path: 'comments',
          select: 'content user',
          populate: {
            path: 'user',
            select: 'email name',
          },
        },
      });

    if (!result) {
      throw new NotFoundException('User not found');
    }

    return result;
  }
}
