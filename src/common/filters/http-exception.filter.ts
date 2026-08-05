import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError, serializeError } from '@johnscodinglab/enterprise-core';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Build request context for all log entries
    const requestContext = {
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.get('user-agent'),
    };

    // Handle enterprise-core errors (AppError, AuthError, etc.)
    if (exception instanceof AppError) {
      const serialized = serializeError(exception);

      this.logger.warn(
        `[${request.method}] ${request.url} → ${serialized.statusCode} ${serialized.code}: ${serialized.message}`,
        { ...requestContext, errorCode: serialized.code },
      );

      return response.status(serialized.statusCode).json({
        success: false,
        error: serialized,
      });
    }

    // Handle NestJS built-in HttpExceptions (ValidationPipe errors, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message;

      // Only warn for client errors (4xx), error for server errors (5xx)
      const logMethod = status >= 500 ? 'error' : 'warn';
      this.logger[logMethod](
        `[${request.method}] ${request.url} → ${status}: ${JSON.stringify(message)}`,
        { ...requestContext, statusCode: status },
      );

      return response.status(status).json({
        success: false,
        error: {
          statusCode: status,
          code: 'HTTP_ERROR',
          message,
        },
      });
    }

    // Unknown/unexpected errors — log FULL details, return generic response
    const errorMessage = exception instanceof Error ? exception.message : 'Unknown error';
    const errorStack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(
      `[${request.method}] ${request.url} → 500 UNHANDLED: ${errorMessage}`,
      errorStack,
      { ...requestContext, exceptionType: exception?.constructor?.name },
    );

    // Don't leak internal details to the client
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
