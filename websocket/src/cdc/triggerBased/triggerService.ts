import { changeHandler } from "../changeHandler";
import { ChangeType, Client, Message } from "../../data/types";
import { WebSocket } from "ws";
import { db } from "../../db/db";


type ChangeLog = {
    message: Message;
    type: ChangeType;
}

const POLL_INTERVAL = 300; // 300 milliseconds

let fetching = false;

export function startTriggerBasedService({ clients }: { clients: Map<WebSocket, Client> }) {
    setInterval(() => {
        const startTime = Date.now();
        if (fetching) {
            console.log('Already fetching changes, skipping this interval');
            return; // Avoid concurrent fetches
        }
        fetching = true;
        fetchChanges().then((changeLogs) => {
            processChanges(changeLogs, clients)
            if (changeLogs.length > 0) {
                console.log(`Fetched ${changeLogs.length} changes in ${(Date.now() - startTime) / 1000}s`);
            }
            fetching = false;
        }).catch((error) => {
            console.error('Error fetching changes:', error);
            fetching = false;
        })
    }, POLL_INTERVAL);
}

async function processChanges(changeLogs: ChangeLog[], clients: Map<WebSocket, Client>) {
    changeLogs.forEach((changeLog) => {
        const { message, type } = changeLog;
        changeHandler({ type: type, payload: message, clients: clients });
    })
}

async function fetchChanges() {
    const result: ChangeLog[] = await db.query(`
        WITH changes AS (
            UPDATE message_change_log
            SET retrieved = TRUE
            WHERE retrieved = FALSE
            RETURNING 
                change_type,
                msg,
                ref_id,
                user_id,
                chat_id,
                updated_at,
                created_at
        )
        SELECT 
            change_type,
            msg,
            ref_id,
            user_id,
            chat_id,
            updated_at,
            created_at
        FROM changes
    `, []).then((res) => {
        return res.rows.map((row) => {
            const updatedAt = new Date(row.updated_at);
            const createdAt = new Date(row.created_at);
            const msg: Message = { userId: row.user_id, username: "default", msg: row.msg, refId: row.ref_id, updatedAt, createdAt, chatId: row.chat_id };
            const type = row.change_type as ChangeType;
            return { message: msg, type: type };
        });
    })
    return result
}