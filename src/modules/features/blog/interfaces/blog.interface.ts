import { Types } from 'mongoose';

export interface IBlog {
  title: string;
  content: string;
  author: Types.ObjectId | string;
  comments?: (Types.ObjectId | string)[];
}
