import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserResponseDto } from '../dto/user-response.dto';
import { Request } from 'express';

// Corrigido: Tipagem explícita para evitar erros de 'any'
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserResponseDto => {
    const request = ctx.switchToHttp().getRequest<Request>();
    // Se request.user não existir, pode lançar um erro ou retornar um valor padrão
    if (!request.user) {
      throw new Error('User not found in request');
    }
    return request.user as UserResponseDto;
  },
);
