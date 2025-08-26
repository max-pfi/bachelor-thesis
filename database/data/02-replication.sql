ALTER TABLE message REPLICA IDENTITY FULL;
CREATE PUBLICATION realtime FOR TABLE message WITH (publish = 'insert, update, delete');
SELECT pg_create_logical_replication_slot('realtime_slot', 'pgoutput');