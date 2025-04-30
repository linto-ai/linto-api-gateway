import { Request, Response, NextFunction } from 'express';
import { MiddlewareFactory } from '../types';
import logger from '@src/modules/coreLogger/CoreLogger';

/**
 * Logs middleware: logs each request and its execution time.
 * Config options:
 *   - level: log level (default: 'info')
 */
const logsMiddleware: MiddlewareFactory = (config = {}) => {
  const allowedLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const;
  type Level = typeof allowedLevels[number];
  const level: Level = allowedLevels.includes(config.level) ? config.level : 'info';
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger[level](`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
  };
};

export default logsMiddleware;