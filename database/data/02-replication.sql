CREATE PUBLICATION realtime FOR TABLE message;
SELECT pg_create_logical_replication_slot('realtime_slot', 'pgoutput');