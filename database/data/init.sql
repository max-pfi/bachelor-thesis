CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE message (
    id SERIAL PRIMARY KEY,
    msg TEXT NOT NULL,
    ref_id TEXT NOT NULL,
    user_id INTEGER,
    chat_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_chat FOREIGN KEY (chat_id) REFERENCES chat(id)
);

CREATE TABLE message_change_log (
    id SERIAL PRIMARY KEY,
    change_type TEXT NOT NULL,
    msg TEXT NOT NULL,
    ref_id TEXT NOT NULL,
    user_id INTEGER,
    chat_id INTEGER,
    retrieved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_users (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL REFERENCES chat(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION log_message_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO message_change_log (
        change_type,
        msg,
        ref_id,
        user_id,
        chat_id,
        created_at,
        updated_at
    ) VALUES (
        'insert',
        NEW.msg,
        NEW.ref_id,
        NEW.user_id,
        NEW.chat_id,
        NEW.created_at,
        NEW.updated_at
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_message_insert
AFTER INSERT ON message
FOR EACH ROW
EXECUTE FUNCTION log_message_insert();

INSERT INTO users (username, password_hash) values ('max', '$2b$10$LWOs8MIXk/Xbohvr/o5uoejZ9PtEiXr0//ylpZgcoeWaGgDCR/d9S');
INSERT INTO users (username, password_hash) values ('john', '$2b$10$LWOs8MIXk/Xbohvr/o5uoejZ9PtEiXr0//ylpZgcoeWaGgDCR/d9S');
INSERT INTO chat (name) values ('Test Chat');
INSERT INTO chat_users (chat_id, user_id) values (1, 1);
INSERT INTO chat_users (chat_id, user_id) values (1, 2);

CREATE PUBLICATION realtime FOR TABLE message;
SELECT pg_create_logical_replication_slot('realtime_slot', 'pgoutput');
