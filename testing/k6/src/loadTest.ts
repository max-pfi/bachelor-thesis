import { execSync } from "child_process";
import dotenv from 'dotenv';



dotenv.config();

const users = 200;
const args = process.argv.slice(2);
const runNumber = args[0] ?? '1';

console.log(`Starting load tests with ${users} users`);

console.log(`---Running test: ${users} users, run ${runNumber}---`);

execSync(`node ./dist/db-setup.js --USER_COUNT=${users} --CHAT_COUNT=${1}`, { stdio: "inherit" });

execSync(`k6 run ./dist/script.js --env USER_COUNT=${users} --env CHAT_COUNT=${1} --out json=./../analysis/data/stress_${runNumber}.json 2> ./../analysis/data/custom_logs_${runNumber}.log`, { stdio: "inherit" });

execSync(`node ./dist/post-processing.js --USER_COUNT=${users} --NEW_TEST_RUN=${true} --RUN_NUMBER=${runNumber} --CDC_METHOD=${process.env.CDC_TYPE}`, { stdio: "inherit" });

