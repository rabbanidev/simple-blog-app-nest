import { Request } from 'express';

export interface AuthRequest extends Request {
  user: JWTPayloadUser;
}

export interface JWTPayloadUser {
  userId: string;
  email: string;
  role?: string;
}
