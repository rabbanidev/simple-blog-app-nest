import { Controller, Post } from '@nestjs/common';

@Controller('/blogs')
export class BlogController {
  @Post('/create')
  findAllBlogs() {
    return {
      message: 'Blog created successfully',
      data: null,
    };
  }
}
