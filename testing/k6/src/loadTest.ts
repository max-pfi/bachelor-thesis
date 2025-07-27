import { execSync } from "child_process";
import dotenv from 'dotenv';

const userCounts = [500];
const runsPerCount = 3;
let firstRun = true;

dotenv.config();

console.log(`Starting load tests with ${userCounts.join(', ')} users, ${runsPerCount} run(s) per count.`);

for (const users of userCounts) {
    for (let run = 1; run <= runsPerCount; run++) {
        console.log(`---Running test: ${users} users, run ${run}---`);

        execSync(`node ./dist/db-setup.js --USER_COUNT=${users}`, { stdio: "inherit" });

        execSync(`k6 run ./dist/script.js --env USER_COUNT=${users} --out json=./dist/results.json 2> ./dist/custom_logs.log`, { stdio: "inherit" });

        execSync(`node ./dist/post-processing.js --USER_COUNT=${users} --NEW_TEST_RUN=${firstRun} --CDC_METHOD=${process.env.CDC_TYPE}`, { stdio: "inherit" });

        firstRun = false;
    }
}

