import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { AppError, serializeError } from '@johnscodinglab/enterprise-core';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Handle enterprise-core errors (AppError, AuthError, etc.)
    if (exception instanceof AppError) {
      const serialized = serializeError(exception);
      return response.status(serialized.statusCode).json({
        success: false,
        error: serialized,
      });
    }

    // Handle NestJS built-in HttpExceptions (ValidationPipe errors, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      return response.status(status).json({
        success: false,
        error: {
          statusCode: status,
          code: 'HTTP_ERROR',
          message:
            typeof exceptionResponse === 'string'
              ? exceptionResponse
              : (exceptionResponse as any).message,
        },
      });
    }

    // Unknown errors — don't leak internal details
    return response.status(500).json({
      success: false,
      error: {
        statusCode: 500,
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
}
