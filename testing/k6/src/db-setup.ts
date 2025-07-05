import { Client } from 'pg'
import dotenv from 'dotenv'
import fs from 'fs'
import jwt from 'jsonwebtoken'

dotenv.config()

const USER_COUNT = 30 // has to match the USER_COUNT in the k6 script

const tokens: Record<string, string> = {}; // jwts to be used in the k6 script

(async () => {
  const client = new Client({ connectionString: process.env.CONNECTION_STRING })

  try {
    await client.connect();

    await client.query('DELETE FROM chat_users')
    await client.query('DELETE FROM message')
    await client.query('DELETE FROM chat')
    await client.query('DELETE FROM users')
    await client.query('ALTER SEQUENCE chat_users_id_seq RESTART WITH 1')
    await client.query('ALTER SEQUENCE message_id_seq RESTART WITH 1')
    await client.query('ALTER SEQUENCE chat_id_seq RESTART WITH 1')
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1')

    await client.query(`INSERT INTO chat (id, name) VALUES (1, 'Test Chat')`)

    // Insert test users and connect them to the chat
    for (let i = 1; i <= USER_COUNT; i++) {
      await client.query(
        `INSERT INTO users (id, username, password_hash) VALUES ($1, $2, $3)`,
        [i, `user-${i}`, process.env.USER_PASSWORD]
      );

      await client.query(
        `INSERT INTO chat_users (chat_id, user_id) VALUES (1, $1)`,
        [i]
      );
      tokens[`${i}`] = jwt.sign({ id: i, username: `user-${i}` }, process.env.JWT_SECRET ?? "", { expiresIn: '1h' });
    }

    // fix sequences to avoid problems when adding anything after testing
    await client.query(`SELECT setval('users_id_seq', $1)`, [USER_COUNT + 1])
    await client.query(`SELECT setval('chat_id_seq', 10)`)

    fs.writeFileSync('./dist/tokens.json', JSON.stringify(tokens, null, 2));

    console.log(`Setup finished: ${USER_COUNT} users created`)
  } catch (err) {
    console.error('DB setup error:', err)
    process.exit(1)
  } finally {
    await client.end()
  }
})();