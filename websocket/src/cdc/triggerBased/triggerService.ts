import { queueChangeHandler } from "../changeHandler";
import { ChangeType, Client, Message } from "../../data/types";
import { WebSocket } from "ws";
import { db } from "../../db/db";


type ChangeLog = {
    message: Message;
    type: ChangeType;
}

const POLL_INTERVAL = 300; // 300 milliseconds

let fetching = false;
let lastSeenId = 0;

export function startTriggerBasedService({ clients }: { clients: Map<WebSocket, Client> }) {
    setInterval(() => {
        if (fetching) {
            console.log('Already fetching changes, skipping this interval');
            return; // Avoid concurrent fetches
        }
        fetching = true;
        fetchChanges().then((changeLogs) => {
            changeLogs.forEach((changeLog) => {
                const { message, type } = changeLog;
                queueChangeHandler(type, message, clients);
            })
            fetching = false;
        }).catch((error) => {
            console.error('Error fetching changes:', error);
            fetching = false;
        })
    }, POLL_INTERVAL);
}

async function fetchChanges() {
    const res = await db.query(`
        SELECT
            id,
            msg_id,
            change_type,
            msg,
            ref_id,
            user_id,
            chat_id,
            created_at,
            updated_at,
            change_id
        FROM message_change_log
        WHERE id > $1
        ORDER BY updated_at ASC
    `, [lastSeenId]);

    const rows = res.rows;

    if (rows.length === 0) return [];

    const highestId = rows.reduce((max, row) => Math.max(max, row.id), lastSeenId);

    // Delete up to the highest ID fetched
    await db.query(`DELETE FROM message_change_log WHERE id <= $1`, [highestId]);

    lastSeenId = highestId;

    return rows.map((row) => {
        const updatedAt = new Date(row.updated_at);
        const createdAt = new Date(row.created_at);
        const msg: Message = {
            id: row.msg_id,
            userId: row.user_id,
            username: "default",
            msg: row.msg,
            refId: row.ref_id,
            updatedAt,
            createdAt,
            chatId: row.chat_id,
            changeId: row.change_id
        };
        const type = row.change_type as ChangeType;
        return { message: msg, type };
    });
}