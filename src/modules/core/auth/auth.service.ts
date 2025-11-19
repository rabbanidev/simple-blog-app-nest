import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { PasswordHelper } from 'src/shared/helpers/password.helper';
import { IUser } from '../user/interfaces/user.interface';
import { LoginDto } from './dto/login.dto';
import { TokenHelper } from 'src/shared/helpers/token.helper';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from 'src/enum';

@Injectable()
export class AuthService {
  private readonly tokenHelper: TokenHelper;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.tokenHelper = new TokenHelper(this.jwtService);
  }

  async register(registerDto: RegisterDto): Promise<IUser> {
    // TODO: check if user already exists
    const user = await this.userService.findByEmail(registerDto.email);
    if (user) {
      throw new BadRequestException('User already exists');
    }

    // TODO: hash password
    const hashPassword = await PasswordHelper.hash(registerDto.password);

    //TODO: Save user to database
    const createdUser = await this.userService.createNewUser({
      ...registerDto,
      password: hashPassword,
    });

    if (!createdUser) {
      throw new BadRequestException('Error register user');
    }

    return createdUser;
  }

  async login(loginDto: LoginDto) {
    // TODO: check if user exists
    const user = (await this.userService.findByEmail(
      loginDto.email,
    )) as IUser & {
      password: string;
      _id: string;
      role: UserRole;
      refreshTokens: string[];
    };
    if (!user) {
      throw new NotFoundException('Invalid email');
    }

    // TODO: check if password is correct
    const isPasswordValid = await PasswordHelper.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    // TODO: Generate access and refresh token
    const accessToken = this.tokenHelper.generateToken(
      { userId: user._id, email: user.email, role: user.role },
      {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      },
    );
    const refreshToken = this.tokenHelper.generateToken(
      { userId: user._id, email: user.email, role: user.role },
      {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      },
    );

    await this.userService.storeRefreshToken(user._id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    // TODO: verify refresh token
    const verifyUser = this.tokenHelper.verifyToken(refreshToken, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
    }) as { userId: string; email: string; role: string };

    // TODO: check if refresh token is in database
    const user = (await this.userService.findByEmail(
      verifyUser.email,
    )) as IUser & {
      password: string;
      _id: string;
      role: UserRole;
      refreshTokens: string[];
    };
    if (!user || user.refreshTokens.length === 0)
      throw new UnauthorizedException('Invalid refresh token');

    if (!user.refreshTokens.includes(refreshToken)) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // TODO: Generate new access and refresh token
    const newAccessToken = this.tokenHelper.generateToken(
      { userId: user._id, email: user.email, role: user.role },
      {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      },
    );
    const newRefreshToken = this.tokenHelper.generateToken(
      { userId: user._id, email: user.email, role: user.role },
      {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      },
    );

    // TODO: store new refresh token in database
    await this.userService.storeRefreshToken(user._id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
