import { Types } from 'mongoose';
import { UserRole } from 'src/enum';

export interface IUser {
  name: string;
  email: string;
  role?: UserRole;
  posts?: string | Types.ObjectId[];
}
