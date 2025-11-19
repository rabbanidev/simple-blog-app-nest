import { UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

export class TokenHelper {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(payload: any, options: JwtSignOptions): string {
    try {
      return this.jwtService.sign(payload, options);
    } catch {
      throw new UnauthorizedException('Could not generate token');
    }
  }

  verifyToken(token: string, options: JwtVerifyOptions): any {
    try {
      return this.jwtService.verify(token, options);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
