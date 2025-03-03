import express from 'express';
import { PORT } from './data/const';
import { messageRouter } from './routes/messages';


const app = express();

app.use(express.json());
app.use('/messages', messageRouter);

app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
});
