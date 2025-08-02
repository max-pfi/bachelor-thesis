import { execSync } from "child_process";
import dotenv from 'dotenv';

const userCount = 350;

dotenv.config();

// get the test run from the args to use for the file name
const args = process.argv.slice(2);
const runNumber = args[0] ?? '1';
const cdcType = process.env.CDC_TYPE ?? '';

console.log(`Starting stress test run ${runNumber} with ${userCount} users and CDC type ${cdcType}.`);

execSync(`node ./dist/db-setup.js --USER_COUNT=${userCount} --CHAT_COUNT=${1}`, { stdio: "inherit" });

execSync(`k6 run ./dist/script.js --env USER_COUNT=${userCount} --env CHAT_COUNT=${1} --env TEST_MODE=stress --env MESSAGE_PHASE=${0} --env RAMP_UP_PHASE=${60} --out json=./../analysis/data/stress_${cdcType}_${runNumber}.json`, { stdio: "inherit" });




