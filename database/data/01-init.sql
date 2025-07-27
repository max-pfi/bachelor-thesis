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
    pre_test BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_chat FOREIGN KEY (chat_id) REFERENCES chat(id)
);

CREATE TABLE chat_users (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL REFERENCES chat(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password_hash) values ('max', '$2b$10$LWOs8MIXk/Xbohvr/o5uoejZ9PtEiXr0//ylpZgcoeWaGgDCR/d9S');
INSERT INTO users (username, password_hash) values ('john', '$2b$10$LWOs8MIXk/Xbohvr/o5uoejZ9PtEiXr0//ylpZgcoeWaGgDCR/d9S');
INSERT INTO chat (name) values ('Test Chat');
INSERT INTO chat_users (chat_id, user_id) values (1, 1);
INSERT INTO chat_users (chat_id, user_id) values (1, 2);


