import { LogicalReplicationService, PgoutputPlugin } from "pg-logical-replication";

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