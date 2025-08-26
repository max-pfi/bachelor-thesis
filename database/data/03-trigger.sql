CREATE TABLE message_change_log (
    id SERIAL PRIMARY KEY,
    change_type TEXT NOT NULL,
    msg_id INTEGER NOT NULL,
    msg TEXT NOT NULL,
    ref_id TEXT NOT NULL,
    user_id INTEGER,
    chat_id INTEGER,
    retrieved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_id INTEGER,
    deleted BOOLEAN
);

CREATE OR REPLACE FUNCTION log_message_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.pre_test THEN
        RETURN NEW;
    END IF;
    INSERT INTO message_change_log (
        msg_id,
        change_type,
        msg,
        ref_id,
        user_id,
        chat_id,
        created_at,
        updated_at,
        change_id,
        deleted
    ) VALUES (
        NEW.id,
        'insert',
        NEW.msg,
        NEW.ref_id,
        NEW.user_id,
        NEW.chat_id,
        NEW.created_at,
        NEW.updated_at,
        NEW.change_id,
        NEW.deleted
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_message_insert
AFTER INSERT ON message
FOR EACH ROW
EXECUTE FUNCTION log_message_insert();