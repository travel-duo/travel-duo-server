import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class UserOwnerOrAdminGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = parseInt(request.params.id, 10);
    const user = request.user;

    // 요청한 사용자가 관리자인 경우
    if (user.role === 'admin') {
      return true;
    }

    // 요청한 사용자가 자신의 정보를 수정하려는 경우
    if (user.id === userId) {
      return true;
    }

    return false;
  }
}
