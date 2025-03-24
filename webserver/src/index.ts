import express from 'express';
import { PORT } from './data/const';
import { messageRouter } from './routes/messages';
import { authRouter } from './routes/auth';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))
app.use(express.json());
app.use(cookieParser());
app.use('/messages', messageRouter);
app.use('/auth', authRouter);

app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
});
