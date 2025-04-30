import { Request, Response, NextFunction } from 'express';

export type MiddlewareFactory = (config: any) => (req: Request, res: Response, next: NextFunction) => void; 