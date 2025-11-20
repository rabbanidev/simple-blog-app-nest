import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Comment here' })
  @IsString()
  @MaxLength(100)
  content: string;
}
