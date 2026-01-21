// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter for consistent error responses
 *
 * All errors will be transformed to a consistent format:
 * {
 *   success: false,
 *   statusCode: number,
 *   message: string,
 *   error: string,
 *   timestamp: string,
 *   path: string
 * }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let error: string;
    let extraData: Record<string, any> = {};

    if (exception instanceof HttpException) {
      // NestJS HTTP exceptions (BadRequestException, UnauthorizedException, etc.)
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || exception.name;

        // Handle validation errors (array of messages)
        if (Array.isArray(message)) {
          message = message.join(', ');
        }

        // Preserve extra data from the exception (e.g., existingSession for 409 conflicts)
        const reservedKeys = ['message', 'error', 'statusCode'];
        for (const key of Object.keys(responseObj)) {
          if (!reservedKeys.includes(key)) {
            extraData[key] = responseObj[key];
          }
        }
      } else {
        message = exception.message;
        error = exception.name;
      }
    } else if (exception instanceof Error) {
      // Generic JavaScript errors - these should be 500s
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
      error = 'Internal Server Error';

      // Log the actual error for debugging (but don't expose to client)
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
      );
    } else {
      // Unknown error type
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
      error = 'Internal Server Error';

      this.logger.error('Unknown error type:', exception);
    }

    const errorResponse: Record<string, any> = {
      success: false,
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...extraData,
    };

    // Log 5xx errors for monitoring
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${message}`,
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${message}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
