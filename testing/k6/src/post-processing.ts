import fs from 'fs';
import readline from 'readline';
import { Client } from 'pg'
import dotenv from 'dotenv'

dotenv.config();

const duplicateElements: number[] = [];
const missingElements: number[] = [];
const correctElements: number[] = [];


(async () => {
    const messageList = await getDbMessageList();
    checkMessageLists(messageList);
})();



async function getDbMessageList() {
    const client = new Client({ connectionString: process.env.CONNECTION_STRING })
    let messageList: string[] = [];
    try {
        await client.connect();

        const res = await client.query(
            'SELECT id FROM message WHERE chat_id = 1 ORDER BY created_at ASC'
        );

        messageList = res.rows.map(row => row.id.toString());

    } catch (err) {
        console.error('DB post processsing error:', err)
        process.exit(1)
    } finally {
        await client.end()
    }
    return messageList;
}

function checkMessageLists(messageList: string[]) {
    const fileStream = fs.createReadStream('./dist/logs.log');
    const reader = readline.createInterface({ input: fileStream });

    reader.on("line", (line) => {
        const match = line.match(/\[MSG_LOG\] messages=\[(.*?)\]/);
        if (!match) return
        const ids = match[1]
            .split(',')

        //append ids to the output file output.log
        fs.appendFileSync('./dist/output.log', ids.join(',') + '\n');
        
        const duplicates = numberOfDuplicates(ids);
        duplicateElements.push(duplicates);
        const missing = numberOfMissingMessages(ids, messageList);
        missingElements.push(missing);
        if(duplicates === 0 && missing === 0) {
            const isCorrectOrder = correctOrder(ids, messageList);
            correctElements.push(isCorrectOrder ? 1 : 0);
        }
    })

    reader.on("close", () => {
        const avgDuplicates = duplicateElements.reduce((a, b) => a + b, 0) / duplicateElements.length;
        const avgMissing = missingElements.reduce((a, b) => a + b, 0) / missingElements.length;
        const correctPercentage = (correctElements.reduce((a, b) => a + b, 0) / correctElements.length) * 100;
        console.log(`Average duplicates: ${avgDuplicates}`);
        console.log(`Average missing messages: ${avgMissing}`);
        console.log(`Correct order percentage (of elements with no duplicates or missing messages): ${correctPercentage.toFixed(2)}%`);
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