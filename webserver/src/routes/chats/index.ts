import express from 'express';
import { db } from '../../db/db';
import { Chat } from '../../data/types';
import { authMiddleware } from '../../middleware/auth';

export const chatRouter = express.Router();
chatRouter.use(authMiddleware);

chatRouter.get('/', async (req, res) => {
    const userId = req.userId;
    console.log('userId', userId);
    if (!userId) {
        res.sendStatus(401);
        return;
    }
    try {
        const result = await db.query<Chat>(`
            SELECT 
                c.id,
                c.name
            FROM chat c
            JOIN (
                SELECT chat_id FROM chat_users WHERE user_id = $1
            ) cu ON cu.chat_id = c.id
          `, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});