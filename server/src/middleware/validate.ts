import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";
import { ApiException } from "../utils/ApiException";

function formatZodError(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

/** Validates req.body against the given schema and replaces req.body with the parsed (typed) result. */
export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        ApiException.badRequest("Invalid request body", formatZodError(result.error))
      );
    }
    req.body = result.data;
    next();
  };
}

/** Validates req.query against the given schema and attaches the parsed result to req.validatedQuery. */
export function validateQuery<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(
        ApiException.badRequest("Invalid query parameters", formatZodError(result.error))
      );
    }
    (req as Request & { validatedQuery: T }).validatedQuery = result.data;
    next();
  };
}
