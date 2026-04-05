type AppError = Error & {
  code?: string;
  statusCode?: number;
};

export function ForbiddenError(message = "Forbidden"): AppError {
  const error = new Error(message) as AppError;
  error.name = "ForbiddenError";
  error.code = "FORBIDDEN";
  error.statusCode = 403;
  return error;
}