import fs from 'fs';
import readline from 'readline';
import { Client } from 'pg'
import dotenv from 'dotenv'
import { CHAT_COUNT } from './const';

dotenv.config();

const duplicateElements: number[] = [];
const missingElements: number[] = [];
const correctElements: number[] = [];
var errorReadingLines = 0;

const originalMessageMap = new Map<number, string[]>(); // map of chatIds with their message IDs in order
const trackedMessageMap = new Map<number, string[][]>(); // map of the actual chatIds


(async () => {
    await getDbMessageList();
    checkMessageLists();
})();



async function getDbMessageList() {
    const client = new Client({ connectionString: process.env.PG_CONNECTION_STRING_LOCALHOST })
    try {
        await client.connect();

        for (var i = 1; i <= 5; i++) {
            const res = await client.query(
                'SELECT id FROM message WHERE chat_id = $1 AND pre_test = FALSE ORDER BY created_at ASC',
                [i]
            );
            const messageList: string[] = res.rows.map(row => row.id.toString());
            originalMessageMap.set(i, messageList);
        }

    } catch (err) {
        console.error('DB post processsing error:', err)
        process.exit(1)
    } finally {
        await client.end()
    }
}

function checkMessageLists() {
    const fileStream = fs.createReadStream('./dist/custom_logs.log');
    const reader = readline.createInterface({ input: fileStream });

    reader.on("line", (line) => {
        const match = line.match(/\[MSG_LOG\] chatId=(\d+) messages=\[(.*?)\]/);
        if (!match) return;

        const chatId = parseInt(match[1])
        const messageIds = match[2].split(',')

        //append ids to the output file output.log
        //fs.appendFileSync('./dist/output.log', ids.join(',') + '\n');7

        const originalMessageList = originalMessageMap.get(chatId);
        if (!originalMessageList) {
            console.error(`Chat ID ${chatId} not found in message map.`);
            errorReadingLines++;
            return;
        }
        // add the messageIds to the trackedMessageMap
        if (!trackedMessageMap.has(chatId)) {
            trackedMessageMap.set(chatId, []);
        }
        trackedMessageMap.get(chatId)!.push(messageIds);
        // check for duplicates, missing messages and correct order
        const duplicates = numberOfDuplicates(messageIds);
        duplicateElements.push(duplicates);
        const missing = numberOfMissingMessages(messageIds, originalMessageList);
        missingElements.push(missing);
        if (duplicates === 0 && missing === 0) {
            const isCorrectOrder = correctOrder(messageIds, originalMessageList);
            correctElements.push(isCorrectOrder ? 1 : 0);
        }
    })

    reader.on("close", () => {

        for(var i = 1; i <= CHAT_COUNT; i++) {
            const originalMessageIds = originalMessageMap.get(i) ?? [];
            fs.appendFileSync('./dist/analysis.log', "o - " + originalMessageIds.join(',') + '\n');
            const trackedMessages = trackedMessageMap.get(i) ?? [];
            for (const messages of trackedMessages) {
                fs.appendFileSync('./dist/analysis.log', "t - " + messages.join(',') + '\n');
            }
        }

        const avgDuplicates = duplicateElements.reduce((a, b) => a + b, 0) / duplicateElements.length;
        const avgMissing = missingElements.reduce((a, b) => a + b, 0) / missingElements.length;
        const correctPercentage = (correctElements.reduce((a, b) => a + b, 0) / correctElements.length) * 100;
        fs.appendFileSync('./dist/analysis.log', "-".repeat(50) + '\n');
        fs.appendFileSync('./dist/analysis.log', `\nAnalysis:\n`);
        fs.appendFileSync('./dist/analysis.log', `Average duplicates: ${avgDuplicates}\n`);
        fs.appendFileSync('./dist/analysis.log', `Average missing messages: ${avgMissing}\n`);
        fs.appendFileSync('./dist/analysis.log', `Correct order percentage (of elements with no duplicates or missing messages): ${correctPercentage.toFixed(2)}%\n`);
    })
}


function numberOfDuplicates(arr: string[]) {
    const length = arr.length;
    const unique = new Set(arr).size;
    return length - unique;
}

function numberOfMissingMessages(arr: string[], dbMessages: string[]) {
    const dbSet = new Set(dbMessages).size;
    const arrSet = new Set(arr).size;
    return dbSet - arrSet;
}

function correctOrder(arr: string[], dbMessages: string[]) {
    for (let i = 0; i < arr.length - 1; i++) {
        const currentDb = dbMessages[i]
        const currentArr = arr[i]
        if (currentDb !== currentArr) {
            return false
        }
    }
    return true;
}