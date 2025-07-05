import { spawn } from "child_process";

const parsePgOutput = () => {
  const proc = spawn("pg_recvlogical", [
    "-U", "postgres",
    "-d", "mydb",
    "--slot=my_slot",
    "--start",
    "-o", "proto_version=1",
    "-f", "-"
  ]);

  proc.stdout.on("data", (data) => {
    const output = data.toString().trim();
    const jsonData = { change: output };
    console.log(JSON.stringify(jsonData));
  });

  proc.stderr.on("data", (data) => {
    console.error(`Error: ${data}`);
  });

  proc.on("close", (code) => {
    console.log(`Process exited with code ${code}`);
  });
};

parsePgOutput();