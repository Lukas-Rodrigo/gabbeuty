import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      const errorPayload =
        typeof payload === 'string' ? { message: payload } : payload;

      const body = {
        success: false,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: req.url,
        error: errorPayload,
      };

      this.logger.warn(
        `HTTP ${status} - ${req.method} ${req.url} - ${JSON.stringify(
          errorPayload,
        )}`,
      );

      return res.status(status).json(body);
    }

    const body = {
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: req.url,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    };

    this.logger.error(`Unhandled exception on ${req.method} ${req.url}`, {
      exception,
    } as any);

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
  }
}
