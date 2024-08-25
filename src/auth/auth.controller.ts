import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  OAuth2ClientFactory,
  OAuth2ServiceType,
} from '@/oauth2-client/oauth2-client.factory';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Response } from 'express';
import { AuthRequest } from '@/auth/interfaces/auth-request.interface';

@ApiTags('auth')
@Controller({
  version: '1',
  path: 'auth',
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly oauth2ClientFactory: OAuth2ClientFactory,
  ) {}

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

  @Get(':provider')
  @ApiOperation({ summary: 'OAuth 로그인 페이지로 리다이렉트합니다.' })
  @ApiParam({ name: 'provider', enum: ['google', 'kakao'] })
  async oauthLogin(
    @Req() req: Request,
    @Param('provider') provider: string,
    @Res() res: Response,
  ) {
    const client = this.getOAuth2Client(provider);
    const scopes = this.getOAuthScopes(provider);
    const authUrl = await client.getAuthorizationUrl(
      scopes,
      this.getClientUrlFromRequest(req),
    );
    res.redirect(authUrl);
  }

  @Get(':provider/callback')
  @ApiOperation({ summary: 'OAuth 콜백을 처리합니다.' })
  @ApiParam({ name: 'provider', enum: ['google', 'kakao'] })
  async oauthCallback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const client = this.getOAuth2Client(provider);
    const tokenData = await client.getToken(code);
    const userData = await this.authService.validateOAuthUser(
      provider,
      tokenData,
    );
    const jwtToken = await this.authService.LoginOrRegisterByOauth2(
      userData.email,
      userData.name,
    );

    // res.cookie('access_token', jwtToken, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'strict',
    // });

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <script>
          
          window.opener.postMessage({
            type: 'oauth',
            provider: '${provider}',
            access_token: '${jwtToken.access_token}',
          }, '${state}' );
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

  // @Post('refresh-token')
  // async refreshToken(@Body('refreshToken') refreshToken: string) {
  //   return this.authService.refreshToken(refreshToken);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Post('logout')
  // async logout(@Req() req: AuthRequest) {
  //   const userId = getUserId(req);
  //   return this.authService.logout(userId);
  // }

  private getOAuth2Client(provider: string) {
    const serviceType = provider.toUpperCase();
    return this.oauth2ClientFactory.getClient(OAuth2ServiceType[serviceType]);
  }

  private getOAuthScopes(provider: string): string[] {
    switch (provider) {
      case 'google':
        return ['profile', 'email'];
      case 'kakao':
        return ['profile', 'account_email'];
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }

  private getClientUrlFromRequest(req: any): string {
    // 'Referer' 헤더에서 클라이언트 URL 추출
    const referer = req.header('Referer');
    if (referer) {
      const url = new URL(referer);
      return `${url.protocol}//${url.host}`;
    }

    // 'Origin' 헤더에서 클라이언트 URL 추출
    const origin = req.header('Origin');
    if (origin) {
      return origin;
    }

    // 'Host' 헤더를 사용하여 클라이언트 URL 생성
    const host = req.header('Host');
    if (host) {
      return `${req.protocol}://${host}`;
    }

    // 기본 클라이언트 URL 반환
    return 'http://localhost:3001';
  }
}
