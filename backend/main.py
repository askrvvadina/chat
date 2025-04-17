from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from typing import List, Optional
import hashlib
import smtplib
import random
import string
from pydantic import EmailStr
from email.message import EmailMessage
import os

app = FastAPI()

# Разрешаем запросы с фронтенда (например, http://localhost:5500)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------- БАЗА ДАННЫХ ----------------------

def get_db():
    conn = sqlite3.connect("chat.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )""")

    cur.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER,
        receiver_id INTEGER,
        group_id INTEGER,
        content TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_read INTEGER DEFAULT 0
    )""")

    cur.execute("""
    CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )""")

    cur.execute("""
    CREATE TABLE IF NOT EXISTS group_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id INTEGER,
        user_id INTEGER
    )""")

    conn.commit()
    conn.close()

init_db()

# ---------------------- МОДЕЛИ ----------------------

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    verificationCode: str

class UserLogin(BaseModel):
    email: str
    password: str

class Message(BaseModel):
    sender_id: int
    receiver_id: Optional[int] = None
    group_id: Optional[int] = None
    content: str

# ---------------------- ХЭЛПЕРЫ ----------------------

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# ---------------------- ФУНКЦИИ ОТПРАВКИ КОДА ----------------------

# Store verification codes in memory (for demo purposes)
# In production, you should use a database or Redis
verification_codes = {}

# Generate a verification code
def generate_verification_code() -> str:
    return ''.join(random.choices(string.digits, k=6))

# Send verification email
def send_verification_email(email: str, code: str):
    # Email configuration
    SMTP_SERVER = "smtp.gmail.com"  # Change based on your email provider
    SMTP_PORT = 587  # Standard TLS port
    
    # Replace with your actual email credentials
    # For Gmail, you'll need to generate an "App Password" if you have 2FA enabled
    # https://myaccount.google.com/apppasswords
    SENDER_EMAIL = "adina.chat.app@gmail.com"
    SENDER_PASSWORD = "abcde12345app" 
    
    # Create the email message
    msg = EmailMessage()
    msg.set_content(f"""
    Hello,
    
    Your verification code for the chat application is: {code}
    
    This code is valid for 10 minutes.
    
    If you did not request this code, please ignore this email.
    
    Best regards,
    The Chat App Team
    """)
    
    msg['Subject'] = 'Your Chat App Verification Code'
    msg['From'] = SENDER_EMAIL
    msg['To'] = email
    
    try:
        # Connect to the server
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()  # Secure the connection
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        
        # Send the email
        server.send_message(msg)
        server.quit()
        
        # Store the code (in a real app, store with expiration time)
        verification_codes[email] = code
        
        print(f"Verification code {code} sent to {email}")
        
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

# For debugging/development: A simplified version that doesn't actually send emails
def send_verification_email_debug(email: str, code: str):
    # Just store the code
    verification_codes[email] = code
    
    # Print instead of sending
    print(f"\n----- DEBUG -----")
    print(f"TO: {email}")
    print(f"SUBJECT: Your Chat App Verification Code")
    print(f"BODY: Your verification code is: {code}")
    print(f"----- END DEBUG -----\n")
    
    # In a real app, you would send an actual email here
    return True

# Модель для email
class EmailRequest(BaseModel):
    email: EmailStr  # This adds automatic email validation

# ---------------------- API ----------------------

@app.post("/register")
def register(user: UserRegister):
    # First verify the code
    stored_code = verification_codes.get(user.email)
    if not stored_code or stored_code != user.verificationCode:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
    
    # Remove the code since it's been used
    verification_codes.pop(user.email)
    
    # Connect to database
    conn = get_db()
    cur = conn.cursor()
    
    try:
        # Insert the new user
        cur.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                   (user.username, user.email, hash_password(user.password)))
        conn.commit()
        
        # Get the user ID for the response
        cur.execute("SELECT id FROM users WHERE email = ?", (user.email,))
        user_id = cur.fetchone()["id"]
        
        return {"message": "User registered successfully", "user_id": user_id}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    finally:
        conn.close()

@app.post("/login")
def login(user: UserLogin):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE email = ?", (user.email,))
    row = cur.fetchone()
    if row and row["password"] == hash_password(user.password):
        return {"message": "Login successful", "user_id": row["id"]}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/send-message")
def send_message(msg: Message):
    if not msg.receiver_id and not msg.group_id:
        raise HTTPException(status_code=400, detail="Receiver or group ID required")

    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO messages (sender_id, receiver_id, group_id, content)
    VALUES (?, ?, ?, ?)
    """, (msg.sender_id, msg.receiver_id, msg.group_id, msg.content))
    conn.commit()
    return {"message": "Message sent"}

@app.get("/messages/{user_id}")
def get_messages(user_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
    SELECT * FROM messages
    WHERE receiver_id = ? OR sender_id = ?
    ORDER BY timestamp DESC
    """, (user_id, user_id))
    rows = cur.fetchall()
    return [dict(row) for row in rows]

@app.get("/users")
def get_users():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, username, email FROM users")
    users = cur.fetchall()
    return [dict(user) for user in users]

@app.get("/users/{user_id}")
def get_user(user_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, username, email FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    if row:
        return dict(row)
    else:
        raise HTTPException(status_code=404, detail="User not found")

# Эндпоинт для отправки кода на email
@app.post("/send-verification-code")
async def send_verification_code(request: EmailRequest):
    # Generate a verification code
    code = generate_verification_code()
    
    try:
        # Отправляем реальное письмо (включи это!)
        send_verification_email(request.email, code)
        
        # Удали или закомментируй debug-версию:
        # send_verification_email_debug(request.email, code)
        
        print(f"Verification code for {request.email}: {code}")
        
        return {"message": "Verification code sent to your email"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

class VerificationRequest(BaseModel):
    email: EmailStr
    code: str

@app.post("/verify-code")
async def verify_code(request: VerificationRequest):
    stored_code = verification_codes.get(request.email)
    
    if not stored_code:
        raise HTTPException(status_code=400, detail="No verification code found for this email")
    
    if stored_code != request.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    # If verification succeeds, remove the code
    verification_codes.pop(request.email)
    
    return {"message": "Email verification successful"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)