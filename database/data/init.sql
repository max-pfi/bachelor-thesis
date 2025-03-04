CREATE TABLE message (
    id SERIAL PRIMARY KEY,
    msg TEXT NOT NULL,
    username TEXT NOT NULL,
    ref_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE PUBLICATION realtime FOR TABLE message;
SELECT pg_create_logical_replication_slot('realtime_slot', 'pgoutput');
