from fastapi import APIRouter, HTTPException, Depends
from datetime import timedelta, datetime
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import List

router=APIRouter()

# Secret key for JWT (use a more secure one in production)
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Use a list to store users, where each user is a dictionary
db = []

# User model for Pydantic validation
class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str


# Helper functions for authentication

def hash_password(password: str) -> str:
    """Hash a plain text password."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """Create a new JWT token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Database functions

def get_user(username: str):
    """Find a user by username."""
    # Search through the list of users (dictionaries)
    return next((user for user in db if user["username"] == username), None)

def add_user(user_data: dict):
    """Add a user to the database."""
    db.append(user_data)

# FastAPI routes

@router.post("/signup", response_model=dict)
def signup(user: UserCreate):
    """Handle user signup."""
    # Check if the username already exists
    if get_user(user.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Hash the user's password and save the user
    hashed_password = hash_password(user.password)
    
    # Add user to the "database"
    add_user({"username": user.username, "hashed_password": hashed_password})
    
    # Debugging: Print the current database to check if the user was added
    print("Current DB:", db)  # Log the database state

    return {"message": "User created successfully"}

@router.get("/db", response_model=List[dict])
def get_db():
    """Get the current state of the database."""
    return db

@router.post("/login", response_model=Token)
def login(user: UserLogin):
    """Handle user login."""
    try:
        # Step 1: Check if the user exists
        db_user = get_user(user.username)
        print("Database User:", db_user)  # Debugging log

        if not db_user:
            raise HTTPException(status_code=400, detail="Invalid username or password")
        
        # Step 2: Verify the password
        if not verify_password(user.password, db_user["hashed_password"]):  # Correct way to access a dictionary value
            raise HTTPException(status_code=400, detail="Invalid username or password")
        
        # Step 3: Create the access token
        access_token = create_access_token(
            data={"sub": user.username},
            expires_delta=timedelta(minutes=30)
        )
        print("Access Token:", access_token)  # Debugging log

        return {"access_token": access_token, "token_type": "bearer"}
    
    except Exception as e:
        print(f"Error: {str(e)}")  # Log the error
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
