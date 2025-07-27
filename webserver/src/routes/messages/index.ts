import express, {Request} from 'express';
import { db } from '../../db/db';
import { authMiddleware } from '../../middleware/auth';

export const messageRouter = express.Router();
messageRouter.use(authMiddleware);

messageRouter.post('/', async (req, res) => {
    const { msg, refId, chatId } = req.body;
    const userId = req.userId;
    if (!userId) {
        res.sendStatus(401);
        return;
    }

    db.query('INSERT INTO message (user_id, msg, ref_id, chat_id) VALUES ($1, $2, $3, $4)', [userId, msg, refId, chatId ])
        .then(() => {
            res.sendStatus(201);
        })
        .catch((e) => {
            console.error(e);
            res.sendStatus(500);
        });
});