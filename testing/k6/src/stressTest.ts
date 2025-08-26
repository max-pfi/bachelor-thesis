import { exec, execSync } from "child_process";
import dotenv from 'dotenv';
import fs from 'fs';

const userCount = 260;

dotenv.config();

// get the test run from the args to use for the file name
const args = process.argv.slice(2);
const runNumber = args[0] ?? '1';
const cdcType = process.env.CDC_TYPE ?? '';


(async () => {
    console.log(`Starting stress test run ${runNumber} with ${userCount} users and CDC type ${cdcType}.`);
    execSync(`node ./dist/db-setup.js --USER_COUNT=${userCount} --CHAT_COUNT=${1}`, { stdio: "inherit" });
    const stopLogging = logResourceUsage();

    try {
        console.log(`Starting k6 stress test. Estimated finish time at ${new Date(Date.now() + 1000 * userCount).toLocaleTimeString()}.`);
        await new Promise((resolve, reject) => {
            const k6 = exec(`k6 run ./dist/script.js --env USER_COUNT=${userCount} --env CHAT_COUNT=${1} --env TEST_MODE=stress --env MESSAGE_PHASE=${0} --out json=./../analysis/data/stress_${runNumber}.json`);
            k6.on('exit', resolve);
            k6.on('error', reject);
        });
    } finally {
        stopLogging();
    }

})();






function logResourceUsage() {
    const statsFile = `./../analysis/data/stress_cpu_memory_${runNumber}.csv`;
    const stream = fs.createWriteStream(statsFile, { flags: 'a' });
    stream.write(`timestamp,container,cpu_percent,memory_usage\n`);

    const interval = setInterval(() => {
        exec(
            'docker stats --no-stream --format "{{.Name}},{{.CPUPerc}},{{.MemUsage}}" websocket',
            (error, stdout, stderr) => {
                if (error || stderr) {
                    return;
                }

                const output = stdout.trim();
                if (!output) {
                    return;
                }

                const timestamp = new Date().toISOString();
                output.split('\n').forEach(line => {
                    if (line.trim()) {
                        stream.write(`${timestamp},${line.trim()}\n`);
                    }
                });
            }
        );
    }, 1000);

    const stop = () => {
        clearInterval(interval);
        stream.end();
    };

    return stop;
}