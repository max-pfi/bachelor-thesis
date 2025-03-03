import express from 'express';
import { PORT } from './data/const';
import { messageRouter } from './routes/messages';
import 'dotenv/config';
import cors from 'cors';

const app = express();


app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173"
}))
app.use('/messages', messageRouter);

app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
});
