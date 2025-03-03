import { LogicalReplicationService, PgoutputPlugin } from "pg-logical-replication";

export const replicationService = new LogicalReplicationService(
  {
    database: 'mydb',
    password: 'postgres',
    user: 'postgres',

  },
  {
    acknowledge: {
      auto: true,
      timeoutSeconds: 10
    }
  }
)

export const pgoutputPlugin = new PgoutputPlugin({
    protoVersion: 1,
    publicationNames: ['my_pub'],
}); 