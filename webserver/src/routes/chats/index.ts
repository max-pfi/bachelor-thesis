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
                c.name,
                cu.user_id IS NOT NULL AS "isInChat"
            FROM chat c
            LEFT JOIN (
                SELECT chat_id, user_id FROM chat_users WHERE user_id = $1
            ) cu ON cu.chat_id = c.id
        `, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

chatRouter.post('/', async (req, res) => {
    const userId = req.userId;
    const { name } = req.body;
    if (!userId || !name) {
        res.sendStatus(400);
        return;
    }
    try {
        const result = await db.query(`
            INSERT INTO chat (name) VALUES ($1) RETURNING id
        `, [name]);
        const chatId = result.rows[0].id;
        await db.query(`
            INSERT INTO chat_users (chat_id, user_id) VALUES ($1, $2)
        `, [chatId, userId]);
        res.status(201).json({ id: chatId, name });
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

chatRouter.post('/:chatId/join', async (req, res) => {
    const userId = req.userId;
    const chatId = req.params.chatId;
    if (!userId || !chatId) {
        res.sendStatus(400);
        return;
    }
    try {
        await db.query(`
            INSERT INTO chat_users (chat_id, user_id) VALUES ($1, $2)
        `, [chatId, userId]);
        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

chatRouter.post('/:chatId/leave', async (req, res) => {
    const userId = req.userId;
    const chatId = req.params.chatId;
    if (!userId || !chatId) {
        res.sendStatus(400);
        return;
    }
    try {
        await db.query(`
            DELETE FROM chat_users WHERE chat_id = $1 AND user_id = $2
        `, [chatId, userId]);
        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});
