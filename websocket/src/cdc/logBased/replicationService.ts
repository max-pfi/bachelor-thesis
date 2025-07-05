import { LogicalReplicationService, PgoutputPlugin } from "pg-logical-replication";
import { changeHandler } from "../changeHandler";
import { Client, Message } from "../../data/types";
import { WebSocket } from "ws";

const dbConfig = {
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  user: process.env.PG_USER,
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

export function startReplicationService({ clients }: { clients: Map<WebSocket, Client> }) {
  const slotName = process.env.REPLICATION_SLOT ?? "";
  replicationService.subscribe(pgoutputPlugin, slotName);

  replicationService.on('data', (_, log) => {
    if (log.tag === "insert") {
      const { msg, user_id, chat_id, ref_id, updated_at, created_at } = log.new;
      const updatedAt = new Date(updated_at);
      const createdAt = new Date(created_at);
      const message: Message = { userId: user_id, username: "default", msg, refId: ref_id, updatedAt, createdAt, chatId: chat_id };
      changeHandler({ type: "insert", payload: message, clients: clients });
    }
  });
}