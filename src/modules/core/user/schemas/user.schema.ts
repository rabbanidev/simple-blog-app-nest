import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserRole } from 'src/enum';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
})
export class User {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
    select: false,
  })
  password: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.User,
  })
  role: UserRole;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Post' }],
  })
  post_ids: Types.ObjectId[];

  @Prop({
    type: [String],
  })
  refreshTokens: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
