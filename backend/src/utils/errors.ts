/** Custom API error class for consistent error handling across the app. */
export class ApiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string): ApiError {
    return new ApiError(message, 400);
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(message, 401);
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(message, 403);
  }

  static notFound(message = 'Not found'): ApiError {
    return new ApiError(message, 404);
  }

  static conflict(message: string): ApiError {
    return new ApiError(message, 409);
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(message, 500);
  }
}
