import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from '@/user/enums/user-role.enum';

@Injectable()
export class UserGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return [UserRole.ADMIN, UserRole.USER].includes(user.role);
  }
}
