import { LogicalReplicationService, PgoutputPlugin } from "pg-logical-replication";
import { Client, Message } from "../../data/types";
import { WebSocket } from "ws";
import { queueChangeHandler } from "../changeHandler";
import { Message as PgMessage } from "pg-logical-replication/dist/output-plugins/pgoutput/pgoutput.types";
const dbConfig = {
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  user: process.env.PG_USER,
  connectionString: process.env.PG_CONNECTION_STRING,
}

export const replicationService = new LogicalReplicationService(
  dbConfig,
  {
    acknowledge: {
      auto: true,
      timeoutSeconds: 10
    }
  }
)

export const pgoutputPlugin = new PgoutputPlugin({
  protoVersion: 1,
  publicationNames: [process.env.PUBLICATION ?? ""],
});

export function startReplicationServiceWithRetry({ clients }: { clients: Map<WebSocket, Client> }) {
  const slotName = process.env.REPLICATION_SLOT ?? "";

  function start() {
    try {
      replicationService.subscribe(pgoutputPlugin, slotName);

      replicationService.on("data", (_, log: PgMessage) => {
        if (log.tag === "insert") {
          const { id, msg, user_id, chat_id, ref_id, updated_at, created_at } = log.new;
          const updatedAt = new Date(updated_at);
          const createdAt = new Date(created_at);
          const message: Message = { id, userId: user_id, username: "default", msg, refId: ref_id, updatedAt, createdAt, chatId: chat_id };
          queueChangeHandler("insert", message, clients);
        }
      });

      replicationService.on("error", (error) => {
        console.error("Replication error:", error);
        replicationService.stop().finally(() => {
          setTimeout(start, 2000);
        });
      });
    } catch (err) {
      console.error("Replication start failed:", err);
      setTimeout(start, 2000);
    }
  }

  start();
}