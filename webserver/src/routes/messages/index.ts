import express from 'express';
import { db } from '../../db/db';

export const messageRouter = express.Router();

messageRouter.post('/', async (req, res) => {
    const { msg, refId, chatId } = req.body;
    const userId = 3 // todo: get userId from auth context
    db.query('INSERT INTO message (user_id, msg, ref_id, chat_id) VALUES ($1, $2, $3, $4)', [userId, msg, refId, chatId ])
        .then(() => {
            console.log(`Message by ${userId} inserted`);
            res.sendStatus(201);
        })
        .catch((e) => {
            console.error(e);
            res.sendStatus(500);
        });
});