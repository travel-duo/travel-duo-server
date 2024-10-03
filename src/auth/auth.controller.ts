import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthRequest } from '@/auth/interfaces/auth-request.interface';
import { AuthGuard } from '@nestjs/passport';
import { FlutterLoginUserDto } from '@/auth/dto/flutter-login-user.dto';
import * as bcrypt from 'bcryptjs';

@ApiTags('auth')
@Controller({
  version: '1',
  path: 'auth',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '회원가입을 진행합니다.' })
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: '로그인을 진행합니다.' })
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  FLUTTER_API_KEY = process.env.FLUTTER_API_KEY;

  @Post('oauth2/flutter')
  @ApiOperation({ summary: '로그인을 진행합니다.' })
  @ApiHeader({
    name: 'X-Api-Key',
    description: 'API 키',
  })
  async loginAndRegisterFlutter(
    @Req() req: Request,
    @Body() flutterLoginUserDto: FlutterLoginUserDto,
  ) {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API 키가 제공되지 않았습니다.');
    }

    const isValidApiKey = await bcrypt.compare(apiKey, this.FLUTTER_API_KEY);

    if (!isValidApiKey) {
      throw new UnauthorizedException('유효하지 않은 API 키입니다.');
    }

    return this.authService.loginAndRegisterFlutter(flutterLoginUserDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth 로그인을 시작합니다.' })
  async googleAuth() {
    // Guard will redirect to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth 콜백을 처리합니다.' })
  async googleAuthRedirect(@Req() req, @Res() res) {
    return this.handleOAuthCallback(req, res, 'google');
  }

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({ summary: 'Kakao OAuth 로그인을 시작합니다.' })
  async kakaoAuth() {
    // Guard will redirect to Kakao
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({ summary: 'Kakao OAuth 콜백을 처리합니다.' })
  async kakaoAuthRedirect(@Req() req, @Res() res) {
    return this.handleOAuthCallback(req, res, 'kakao');
  }

  private async handleOAuthCallback(req, res, provider: string) {
    const { user } = req;
    const jwtToken = await this.authService.LoginOrRegisterByOauth2(
      user.email,
      user.name,
    );

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <script>
          window.opener.postMessage({
            type: 'oauth',
            provider: '${provider}',
            access_token: '${jwtToken.access_token}',
          }, '${process.env.CLIENT_URL}');
          window.close();
        </script>
      </head>
      <body>
        <h1>인증 완료</h1>
        <p>이 창은 곧 닫힙니다.</p>
      </body>
      </html>
    `);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: AuthRequest) {
    return req.user;
  }
}
