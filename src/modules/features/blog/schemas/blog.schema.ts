import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
})
export class Blog {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: String,
    required: true,
  })
  content: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Comment' }],
  })
  comments: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  author: Types.ObjectId;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
