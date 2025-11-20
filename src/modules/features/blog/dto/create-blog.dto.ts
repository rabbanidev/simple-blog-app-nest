import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({ example: 'Learning Nest JS' })
  @IsString()
  @MaxLength(50)
  title: string;

  @ApiProperty({
    example:
      'A progressive Node.js framework for building efficient, reliable and scalable server-side applications.',
  })
  @IsString()
  @MaxLength(200)
  content: string;
}
