import { Request, Response, NextFunction } from "express";

class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = (err as any).code === "LIMIT_FILE_SIZE" ? 413 : err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 413 ? "Image must be smaller than 10 MB" : statusCode >= 500 ? "The request could not be completed. Please try again." : err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export { errorHandler, AppError };
