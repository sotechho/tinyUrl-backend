export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_SERVER_ERROR',
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string>[];

  constructor(
    message: string = 'Validation Error',
    errors: Record<string, string>[],
  ) {
    super(message, 422, 'VALIDATION', true);
    this.errors = errors;

    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request') {
    super(message, 400, 'BAD_REQUEST');
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found') {
    super(message, 404, 'NOT_FOUND');
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class MethodNotAllowedError extends AppError {
  constructor(message: string = 'Method Not Allowed') {
    super(message, 405, 'METHOD_NOT_ALLOWED');
    Object.setPrototypeOf(this, MethodNotAllowedError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, 409, 'CONFLICT');
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too Many Requests') {
    super(message, 429, 'TOO_MANY_REQUESTS');
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error') {
    super(message, 500, 'INTERNAL_SERVER_ERROR', false);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

export class NotImplementedError extends AppError {
  constructor(message: string = 'Not Implemented') {
    super(message, 501, 'NOT_IMPLEMENTED');
    Object.setPrototypeOf(this, NotImplementedError.prototype);
  }
}

export class BadGatewayError extends AppError {
  constructor(message: string = 'Bad Gateway') {
    super(message, 502, 'BAD_GATEWAY');
    Object.setPrototypeOf(this, BadGatewayError.prototype);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service Unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}

export class GatewayTimeoutError extends AppError {
  constructor(message: string = 'Gateway Timeout') {
    super(message, 504, 'GATEWAY_TIMEOUT');
    Object.setPrototypeOf(this, GatewayTimeoutError.prototype);
  }
}

export class ExternalServiceError extends AppError {
  public readonly externalServiceName: string;
  constructor(
    message: string = 'External service error',
    externalServiceName: string = 'Unknown',
  ) {
    super(
      `${externalServiceName}: ${message}`,
      502,
      'EXTERNAL_SERVICE_ERROR',
      true,
    );
    this.externalServiceName = externalServiceName;
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}
