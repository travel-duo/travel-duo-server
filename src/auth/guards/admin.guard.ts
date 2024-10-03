import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from '@/user/enums/user-role.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return user.role === UserRole.ADMIN;
  }
}
