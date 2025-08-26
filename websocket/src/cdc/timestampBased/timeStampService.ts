import { Client, Message } from "../../data/types";
import { WebSocket } from "ws";
import { db } from "../../db/db";
import { queueChangeHandler } from "../changeHandler";

const POLL_INTERVAL = 300; // 300 milliseconds

let timestamp: number | null = null;
let fetching = false;

export function startTimestampService({ clients }: { clients: Map<WebSocket, Client> }) {
    setInterval(() => {
        if (!timestamp) {
            timestamp = Date.now();
            return;
        }
        if (fetching) {
            console.log('Already fetching changes, skipping this interval');
            return; // Avoid concurrent fetches
        }
        fetching = true;
        fetchChangesSince(timestamp).then((messages) => {
            messages.forEach((message) => {
                // This could theoretically cause issues if messages are updated immediately after being created
                // Since the polling interval is 300ms, this should not never really happen
                const newEntry = message.updatedAt.getTime() === message.createdAt.getTime();
                const changeType = newEntry ? "insert" : "update";
                queueChangeHandler(changeType, message, clients);
            })
            fetching = false;
        }).catch((error) => {
            console.error('Error fetching changes:', error);
            fetching = false;
        })
    }, POLL_INTERVAL);
}

async function fetchChangesSince(timestamp: number) {
    const result: Message[] = await db.query(`
        SELECT
            message.id,
            message.user_id, 
            message.msg, 
            message.ref_id,
            message.updated_at,
            message.created_at,
            message.chat_id,
            message.change_id
        FROM message
        WHERE updated_at > to_timestamp($1)
        AND message.pre_test = FALSE
        ORDER BY updated_at ASC
    `, [timestamp / 1000]).then((res) => {
        return res.rows.map((row) => {
            const updatedAt = new Date(row.updated_at);
            const createdAt = new Date(row.created_at);
            return { id: row.id, userId: row.user_id, username: "default", msg: row.msg, refId: row.ref_id, updatedAt, createdAt, chatId: row.chat_id, changeId: row.change_id };
        });
    })
    const latestDate = result.reduce((max, msg) => {
        const msgDate = msg.updatedAt.getTime();
        return msgDate > max ? msgDate : max;
    }, 0);
    if (latestDate > timestamp) {
        timestamp = latestDate;
    }
    return result
}