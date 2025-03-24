import os
import sqlite3
from pathlib import Path
from contextlib import contextmanager

# Create database directory if it doesn't exist
DB_DIR = Path("data/db")
DB_DIR.mkdir(parents=True, exist_ok=True)

# Database file path
DB_PATH = DB_DIR / "app.db"

def init_db():
    """Initialize the database with required tables."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Add more tables as needed
        
        conn.commit()

@contextmanager
def get_db_connection():
    """Get a database connection with context management."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    try:
        yield conn
    finally:
        conn.close()

# User database operations
def get_user_by_email(email):
    """Find a user by email."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        if user:
            return dict(user)  # Convert Row to dict
        return None

def create_user(email, hashed_password):
    """Create a new user."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO users (email, hashed_password) VALUES (?, ?)",
                (email, hashed_password)
            )
            conn.commit()
            return True
        except sqlite3.IntegrityError:
            # Email already exists
            return False

def get_all_users():
    """Get all users (for debugging)."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, created_at FROM users")
        return [dict(row) for row in cursor.fetchall()]