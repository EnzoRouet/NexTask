import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email?: string;
    role: 'USER' | 'ADMIN';
  };
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (request.user.role !== 'ADMIN') {
      throw new ForbiddenException(
        "Vous n'avez pas la permission d'accéder a cet espace",
      );
    }
    return true;
  }
}
