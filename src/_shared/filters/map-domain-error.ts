import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ResourceNotFoundError } from '../errors/resource-not-found.error';
import { AlreadyExists } from '../errors/already-exists.error';
import { InvalidDateError } from '../errors/invalid-date-error';
import { NotBelongsError } from '../errors/not-belongs.error';
import { UseCaseError } from '../errors/use-case-error.interface';
import { WrongCredentialsError } from '../errors/wrong-credentials-error';
import { TokenExpiredError } from '../errors/token-expired-error';

export function mapDomainErrorToHttpException(error: UseCaseError) {
  switch (error.constructor) {
    // 404 Not Found - Recurso não encontrado
    case ResourceNotFoundError:
      return new NotFoundException({
        code: 'RESOURCE_NOT_FOUND',
        message: error.message,
      });

    // 409 Conflict - Recurso já existe
    case AlreadyExists:
      return new ConflictException({
        code: 'ALREADY_EXISTS',
        message: error.message,
      });

    // 400 Bad Request - Recurso não pertence ao usuário
    case NotBelongsError:
      return new BadRequestException({
        code: 'NOT_BELONGS',
        message: error.message,
      });

    // 400 Bad Request - Data inválida
    case InvalidDateError:
      return new BadRequestException({
        code: 'INVALID_DATE',
        message: error.message,
      });

    // 401 Unauthorized - Credenciais inválidas
    case WrongCredentialsError:
      return new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: error.message,
      });

    // 401 Unauthorized - Token expirado
    case TokenExpiredError:
      return new UnauthorizedException({
        code: 'TOKEN_EXPIRED',
        message: error.message,
      });

    // Default - Erro desconhecido
    default:
      return new BadRequestException({
        code: 'UNKNOWN_ERROR',
        message: error.message || 'Unexpected domain error',
      });
  }
}
