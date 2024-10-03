import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/user/user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@/user/enums/user-role.enum';
import { validateGoogleIdToken } from '@/auth/utils/auth.util';
import { FlutterLoginUserDto } from '@/auth/dto/flutter-login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
    const user = await this.usersService.create({
      ...registerUserDto,
      password: hashedPassword,
      role: UserRole.USER,
    });
    const { password, ...result } = user;
    return result;
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.usersService.findOneByEmail(loginUserDto.email);
    if (user && (await bcrypt.compare(loginUserDto.password, user.password))) {
      const payload = { email: user.email, sub: user._id };
      return {
        access_token: this.jwtService.sign(payload, {
          expiresIn: '1d',
        }),
      };
    }
    throw new UnauthorizedException('이메일 주소나 비밀번호가 잘못되었습니다.');
  }

  async loginAndRegisterFlutter(flutterLoginUserDto: FlutterLoginUserDto) {
    return this.LoginOrRegisterByOauth2(
      flutterLoginUserDto.email,
      flutterLoginUserDto.name,
      flutterLoginUserDto.oauthType,
    );
  }

  async validateOAuthUser(provider: string, tokenData: any) {
    if (provider === 'google') {
      const { id_token } = tokenData;
      const userData = validateGoogleIdToken(id_token);
      return {
        email: userData.email,
        name: userData.name,
      };
    }
    throw new UnauthorizedException('지원하지 않는 OAuth 공급자입니다.');
  }

  async LoginOrRegisterByOauth2(
    email: string,
    name: string,
    oauthType?: string,
  ) {
    let user = await this.usersService.findOneByEmail(email);
    if (!user) {
      user = await this.usersService.create({
        email,
        name,
        password: '',
        oauthType,
        role: UserRole.USER,
      });
    }
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: '1d',
      }),
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}

// async refreshToken(userId: number) {
//   const user = await this.usersService.findOne(userId);
//   if (!user) {
//     throw new UnauthorizedException('유효하지 않은 사용자입니다.');
//   }
//   const payload = { email: user.email, sub: user.id };
//   return {
//     access_token: this.jwtService.sign(payload),
//   };
// }
