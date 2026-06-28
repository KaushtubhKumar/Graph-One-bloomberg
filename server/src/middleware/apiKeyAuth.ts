import { Request, Response, NextFunction } from 'express';
import { env } from '../utils/env';

export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-api-key'];
  if (!key || key !== env.API_KEY) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Valid X-API-Key header required for write operations.' } });
    return;
  }
  next();
}
