import { Types } from 'mongoose';
import { UserRole } from 'src/enum';

export interface IUser {
  name: string;
  email: string;
  role?: UserRole;
  post_ids?: string | Types.ObjectId[];
}
