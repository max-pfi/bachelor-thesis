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

messageRouter.put('/:id', async (req, res) => {
    const { msg } = req.body;
    const userId = req.userId;
    const messageId = req.params.id;

    if (!userId) {
        res.sendStatus(401);
        return;
    }

    db.query(`UPDATE message SET msg = $1, change_id = nextval('message_change_seq'), updated_at = now() WHERE id = $2 AND user_id = $3`, [msg, messageId, userId])
        .then(() => {
            res.sendStatus(204);
        })
        .catch((e) => {
            console.error(e);
            res.sendStatus(500);
        });
});

messageRouter.delete('/:id', async (req, res) => {
    const userId = req.userId;
    const messageId = req.params.id;

    if (!userId) {
        res.sendStatus(401);
        return;
    }

    db.query('DELETE FROM message WHERE id = $1 AND user_id = $2', [messageId, userId])
        .then(() => {
            res.sendStatus(204);
        })
        .catch((e) => {
            console.error(e);
            res.sendStatus(500);
        });
});
