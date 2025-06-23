import express from 'express';
import { db } from '../../db/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { TokenPayload, User } from '../../data/types';

export const authRouter = express.Router();

authRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userResult = await db.query<User>('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length !== 1) {
        res.sendStatus(401);
        return;
    }
    const user = userResult.rows[0];
    bcrypt.compare(password, user.password_hash)
        .then((match) => {
            if (match) {
                const tokenPayload : TokenPayload = { id: user.id, username: user.username }
                const token = jwt.sign(tokenPayload, "SECRET", { expiresIn: '6h' });
                res.cookie('token', token, { httpOnly: true, secure: false });
                res.json({
                    id: user.id,
                    username: user.username,
                    token,
                });
            } else {
                res.sendStatus(401);
            }
        }
        );
});

authRouter.post('/logout', (_, res) => {
    res.clearCookie('token');
    res.sendStatus(200);
});

authRouter.post('/session', async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        res.sendStatus(401);
        return;
    }
    try {
        const user = jwt.verify(token, "SECRET") as TokenPayload;
        res.json({
            id: user.id,
            username: user.username,
            token,
        })

    } catch (e) {
        res.sendStatus(401);
    }
});


authRouter.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const userResult = await db.query<User>('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length > 0) {
        res.sendStatus(409);
        return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const createdResult = await db.query<User>('INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *', [username, hashedPassword]);
        console.log(createdResult);
        if (createdResult.rowCount !== 1) {
            throw new Error('Failed to create user');
        }
        const user = createdResult.rows[0];
        const token = jwt.sign({
            id: user.id, username: user.username
        }, "SECRET", { expiresIn: '6h' });
        res.cookie('token', token, { httpOnly: true, secure: false });
        res.json({
            id: user.id,
            username: user.username,
            token,
        })
    } catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
});