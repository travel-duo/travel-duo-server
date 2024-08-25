import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from '@/user/enums/user-role.enum';

@Injectable()
export class AdminTeacherGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return [UserRole.ADMIN, UserRole.TEACHER].includes(user.role);
  }
}
