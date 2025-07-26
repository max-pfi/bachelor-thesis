import { Client } from 'pg'
import dotenv from 'dotenv'
import fs from 'fs'
import jwt from 'jsonwebtoken'
import minimist from 'minimist'

dotenv.config()

const tokens: Record<string, string> = {}; // jwts to be used in the k6 script

const args = minimist(process.argv.slice(2));
const USER_COUNT = args.USER_COUNT ? parseInt(args.USER_COUNT) : 25;
const CHAT_COUNT = args.CHAT_COUNT ? parseInt(args.CHAT_COUNT) : 5;

(async () => {

  const client = new Client({ connectionString: process.env.PG_CONNECTION_STRING_LOCALHOST });

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

    for (let j = 1; j <= 5; j++) {
      await client.query(
        `INSERT INTO chat (id, name) VALUES ($1, $2)`,
        [j, `Test Chat ${j}`]
      );
    }

    // Insert test users and connect them to the chat
    for (let i = 1; i <= USER_COUNT; i++) {
      await client.query(
        `INSERT INTO users (id, username, password_hash) VALUES ($1, $2, $3)`,
        [i, `user-${i}`, process.env.USER_PASSWORD]
      );

      // all test users will be able to access all test chats
      for (let j = 1; j <= CHAT_COUNT; j++) {
        await client.query(
          `INSERT INTO chat_users (chat_id, user_id) VALUES ($1, $2)`,
          [j, i]
        );
      }
      tokens[`${i}`] = jwt.sign({ id: i, username: `user-${i}` }, process.env.JWT_SECRET ?? "", { expiresIn: '1h' });
    }

    await client.query('BEGIN');
    await client.query('ALTER TABLE message DISABLE TRIGGER ALL');

    // add sample messages for random chats / users
    for (let i = 0; i < 2000; i++) {
      const userId = Math.floor(Math.random() * USER_COUNT) + 1;
      const chatId = Math.floor(Math.random() * CHAT_COUNT) + 1;
      const msg = `Sample message ${i + 1} from user ${userId} in chat ${chatId}`;
      await client.query(
        `INSERT INTO message (user_id, chat_id, msg, pre_test, ref_id) VALUES ($1, $2, $3, TRUE, $4)`,
        [userId, chatId, msg, `ref-${i + 1}`]
      );
    }

    await client.query('ALTER TABLE message ENABLE TRIGGER ALL');
    await client.query('COMMIT');

    // fix sequences to avoid problems when adding anything after testing
    await client.query(`SELECT setval('users_id_seq', $1)`, [USER_COUNT + 1])
    await client.query(`SELECT setval('chat_id_seq', 10)`)

    fs.writeFileSync('./dist/tokens.json', JSON.stringify(tokens, null, 2));

    console.log(`${USER_COUNT} users created, ${CHAT_COUNT} chats created, 2000 messages added.`);
    console.log(`Waiting for changes to be processed...`);

    // wait for 5 seconds to ensure the changes are processed by the CDC methods of the websocket server before starting the tests
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log(`DB setup completed successfully.`);


  } catch (err) {
    console.error('DB setup error:', err)
    process.exit(1)
  } finally {
    await client.end()
  }
})();