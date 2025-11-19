import { Injectable, NotFoundException } from '@nestjs/common';
import { IUser } from './interfaces/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { UserRole } from 'src/enum';

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
}
