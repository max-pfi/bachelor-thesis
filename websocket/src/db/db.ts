import { Pool } from 'pg';


export const db = new Pool({
    connectionString: process.env.PG_CONNECTION_STRING
});