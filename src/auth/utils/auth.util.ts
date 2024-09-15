import { UnauthorizedException } from '@nestjs/common';
import { AuthRequest } from '@/auth/interfaces/auth-request.interface';
import * as jwt from 'jsonwebtoken';

export function getUserId(req: AuthRequest): bigint {
  const userId = (req as any).user?.userId;
  if (!userId) {
    throw new UnauthorizedException('User ID not found in request');
  }
  return userId;
}

interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export function decodeGoogleIdToken(idToken: string): GoogleUserInfo {
  try {
    // JWT의 두 번째 부분(payload)만 디코드합니다.
    const payload = idToken.split('.')[1];
    const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8');
    const userInfo = JSON.parse(decodedPayload);

    return {
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      given_name: userInfo.given_name,
      family_name: userInfo.family_name,
    };
  } catch (error) {
    console.error('Error decoding Google ID token:', error);
    throw new Error('Invalid ID token');
  }
}

export function validateGoogleIdToken(idToken: string): GoogleUserInfo {
  try {
    // 여기서는 간단히 디코딩만 수행합니다.
    // 실제 프로덕션 환경에서는 토큰의 서명을 확인하고 만료 여부를 체크해야 합니다.
    const decodedToken = jwt.decode(idToken) as jwt.JwtPayload;

    if (!decodedToken) {
      throw new Error('Invalid ID token');
    }

    return {
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      given_name: decodedToken.given_name,
      family_name: decodedToken.family_name,
    };
  } catch (error) {
    console.error('Error validating Google ID token:', error);
    throw new Error('Invalid ID token');
  }
}
