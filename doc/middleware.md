# Middleware System for LinTO API Gateway

## Overview

The API Gateway supports dynamic, per-endpoint middleware chains for all proxied services. Middlewares are declared in Docker service labels and loaded dynamically from the `src/middlewares/` directory.

## Middleware Structure

- Each middleware is a folder in `src/middlewares/`, e.g.:
  - `src/middlewares/auth/index.ts`
  - `src/middlewares/cors/index.ts`
  - `src/middlewares/logs/index.ts`
- The entry point is always `index.ts` and must export a default function matching the standard interface.

## Standard Middleware Interface

```ts
import { Request, Response, NextFunction } from 'express';
export type MiddlewareFactory = (config: any) => (req: Request, res: Response, next: NextFunction) => void;
```

- The factory receives the config object (parsed from Docker labels for the endpoint).
- It must return a standard Express middleware function.

## Example: logs middleware

**src/middlewares/logs/index.ts**

```ts
import { Request, Response, NextFunction } from 'express';
import { MiddlewareFactory } from '../types';
import logger from '@src/modules/coreLogger/CoreLogger';

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
```

## How to add a new middleware

1. **Create a folder** in `src/middlewares/` with the middleware name (e.g. `mycustom`)
2. **Add an `index.ts`** that exports a default function matching the interface above.
3. **Declare the middleware in your service's Docker labels**:
   - `linto.gateway.endpoint.simpleservice.middleware: 'mycustom'`
   - `linto.gateway.endpoint.simpleservice.middleware.mycustom.option: 'value'`
4. **The gateway will load and apply your middleware automatically.**

## Error handling

- If a middleware fails to load, a 500 error is returned and the error is logged.
- Middlewares should call `next(err)` to propagate errors to Express.

## Notes

- Middlewares are loaded in the order declared in the label.
- You can use any npm package in your middleware (add it to the main project dependencies).
- Middlewares can be async if needed (just return an async function). 
