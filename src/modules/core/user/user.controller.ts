import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { AuthRequest } from 'src/interfaces';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @Get('/my-profile')
  async getMyProfile(@Req() req: AuthRequest) {
    const result = await this.userService.getMyProfile(req.user);
    return { message: 'My profile data fetch successfully', data: result };
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @Get('/my-posts')
  async getMyPosts(@Req() req: AuthRequest) {
    const result = await this.userService.getMyPosts(req.user);
    return { message: 'My posts fetch successfully', data: result };
  }

  @Get('/:id')
  async getUserDetails(@Param('id') id: string) {
    const result = await this.userService.getUserDetails(id);
    return { message: 'User details fetch successfully', data: result };
  }
}
