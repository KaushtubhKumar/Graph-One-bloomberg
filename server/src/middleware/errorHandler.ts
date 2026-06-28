import { Request, Response, NextFunction } from "express";
import { ApiException } from "../utils/ApiException";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      code: "ROUTE_NOT_FOUND",
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiException) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    });
  }

  // Supabase/Postgres errors often arrive as plain objects with a `message` and `code`
  if (typeof err === "object" && err !== null && "message" in err) {
    const pgErr = err as { message: string; code?: string; details?: string };

    // Unique violation
    if (pgErr.code === "23505") {
      return res.status(409).json({
        error: { message: "A record with this value already exists.", code: "CONFLICT" },
      });
    }
    // Foreign key violation
    if (pgErr.code === "23503") {
      return res.status(400).json({
        error: {
          message: "Referenced record does not exist.",
          code: "FOREIGN_KEY_VIOLATION",
          details: pgErr.details,
        },
      });
    }
  }

  console.error("[Unhandled Error]", err);
  const isDev = process.env.NODE_ENV === "development";
  let message = "Internal server error";
  if (isDev) {
    if (err instanceof Error) message = err.message;
    else if (typeof err === "object" && err !== null && "message" in err) {
      message = String((err as { message: unknown }).message);
    }
  }
  return res.status(500).json({
    error: { message, code: "INTERNAL_ERROR" },
  });
}
