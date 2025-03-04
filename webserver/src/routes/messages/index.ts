import express from 'express';
import { db } from '../../db/db';

export const messageRouter = express.Router();

messageRouter.post('/', async (req, res) => {
    const { user, msg, refId } = req.body;
    db.query('INSERT INTO message (username, msg, ref_id) VALUES ($1, $2, $3)', [user, msg, refId ])
        .then(() => {
            console.log(`Message by ${user} inserted`);
            res.sendStatus(201);
        })
        .catch((e) => {
            console.error(e);
            res.sendStatus(500);
        });
});