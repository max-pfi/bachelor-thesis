import { Pool } from 'pg';
import 'dotenv/config';


export const db = new Pool({
    connectionString: process.env.PG_CONNECTION_STRING
});