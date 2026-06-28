import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

/**
 * Wraps an async Express handler so thrown errors (or rejected promises)
 * are forwarded to next(), letting the central error middleware handle them.
 * Without this, an unhandled rejection in an async route would hang the request.
 */
export function asyncHandler(fn: AsyncRouteHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
