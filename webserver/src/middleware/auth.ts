import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { TokenPayload } from '../data/types';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token;
    if (!token) {
        res.sendStatus(401);
        return;
    }
    try {
        const decodedToken = jwt.verify(token, "SECRET") as TokenPayload;
        if (!decodedToken) {
            throw new Error('Token verify failed');
        }
        req.userId = decodedToken.id;
        next();
    } catch (error) {
        console.error('Token error:', error);
        res.sendStatus(401);
        return;
    }
}