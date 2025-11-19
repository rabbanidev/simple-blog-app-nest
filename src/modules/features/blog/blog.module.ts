import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';

@Module({
  imports: [],
  controllers: [BlogController],
  providers: [],
  exports: [],
})
export class BlogModule {}
