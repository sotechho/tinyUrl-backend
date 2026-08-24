import type { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export function successResponse<T = unknown>(
  res: Response,
  message: string,
  data?: T,
  meta?: ApiResponse['meta'],
  statusCode: number = 200,
): Response {
  const response: ApiResponse = {
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(meta !== undefined && { meta }),
  };
  return res.status(statusCode).json(response);
}

export function errorResponse(
  res: Response,
  message: string,
  statusCode: number,
  errors?: ApiResponse['errors'],
): Response {
  const response: ApiResponse = {
    success: false,
    message,
    ...(errors !== undefined && { errors }),
  };
  return res.status(statusCode).json(response);
}

export function createdResponse<T>(
  res: Response,
  message: string,
  data?: T,
): Response {
  return successResponse(res, message, data, undefined, 201);
}

export function noContentResponse(res: Response): Response {
  return res.status(204).send();
}

export function paginatedResponse<T>(
  res: Response,
  message: string,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
): Response {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return successResponse(res, message, data, {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages,
  });
}
