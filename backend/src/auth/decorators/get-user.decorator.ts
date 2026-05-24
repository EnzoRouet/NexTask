import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActiveUser } from '../types/active-user.interface';

//***********************************************
//*** Décorateur pour récupérer les utilisateurs
//*********************************************

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ActiveUser => {
    const request = ctx.switchToHttp().getRequest<{ user: ActiveUser }>();

    return request.user;
  },
);
