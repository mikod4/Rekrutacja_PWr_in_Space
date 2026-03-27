import sqlite3
import config


def get_database_connection():
    conn = sqlite3.connect(config.DATABSE_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def databse_init():
    conn = get_database_connection()
    with open(config.DATABASE_SCHEMA_NAME, 'r', encoding='utf-8') as f:
        conn.execute(f.read())

    conn.commit()
    conn.close()


def add_message(sender: str, receiver: str, message: str):
    conn = get_database_connection()
    cursor = conn.execute(
        'INSERT INTO chat_history (sender, receiver, content) VALUES (?, ?, ?)', (
            sender, receiver, message)
    )

    conn.commit()
    conn.close()

    return cursor.lastrowid


def get_recent_messages(limit: int, offset: int = 0):
    if limit <= 0:
        return []

    conn = get_database_connection()
    cursor = conn.execute(
        'SELECT * FROM chat_history ORDER BY created_at DESC LIMIT (?) OFFSET (?)', (
            limit, offset)
    )

    data = cursor.fetchall()
    data.reverse()

    conn.close()
    return data


def get_history():
    conn = get_database_connection()
    cursor = conn.execute(
        'SELECT * FROM chat_history ORDER BY created_at DESC'
    )

    data = cursor.fetchall()

    conn.close()
    return data
