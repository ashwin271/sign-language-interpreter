from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from datetime import timedelta, datetime
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

# Import database functions
from database.db import get_user_by_email, create_user, get_all_users

router = APIRouter(prefix="/auth")

# Secret key for JWT (use a more secure one in production)
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token validation
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# User models for Pydantic validation
class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class UserResponse(BaseModel):
    email: str


# Helper functions for authentication
def hash_password(password: str) -> str:
    """Hash a plain text password."""
    try:
        hashed_password = pwd_context.hash(password)
        return hashed_password
    except Exception as e:
        print(f"Error hashing password: {e}")  # Log the error
        raise HTTPException(status_code=500, detail="Error hashing password")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against a hashed password."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"Error verifying password: {e}")  # Log the error
        raise HTTPException(status_code=500, detail="Error verifying password")

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """Create a new JWT token."""
    try:
        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    except Exception as e:
        print(f"Error creating JWT token: {e}")  # Log the error
        raise HTTPException(status_code=500, detail="Error creating JWT token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Validate token and return current user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user_by_email(email)
    if user is None:
        raise credentials_exception
    
    return user


# FastAPI routes

@router.post("/signup", response_model=dict)
def signup(user: UserCreate):
    """Handle user signup."""
    try:
        # Check if the email already exists
        if get_user_by_email(user.email):
            raise HTTPException(status_code=400, detail="Email already exists")
        
        # Hash the user's password
        hashed_password = hash_password(user.password)
        
        # Add user to the database
        success = create_user(user.email, hashed_password)
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to create user")

        return {"message": "User created successfully"}
    
    except HTTPException as http_err:
        print(f"HTTP Exception: {http_err.detail}")  # Log HTTP errors
        raise
    
    except Exception as e:
        print(f"Error during signup: {e}")  # Log the error in detail
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/users", response_model=List[dict])
def get_users():
    """Get all users (for debugging)."""
    return get_all_users()

@router.post("/login", response_model=Token)
def login(user: UserLogin):
    """Handle user login."""
    try:
        # Step 1: Check if the user exists
        db_user = get_user_by_email(user.email)

        if not db_user:
            raise HTTPException(status_code=400, detail="Invalid email or password")
        
        # Step 2: Verify the password
        if not verify_password(user.password, db_user["hashed_password"]):
            raise HTTPException(status_code=400, detail="Invalid email or password")
        
        # Step 3: Create the access token
        access_token = create_access_token(
            data={"sub": user.email},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        # Return token and user data (matching frontend expectations)
        user_data = {"email": db_user["email"]}
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": user_data
        }
    
    except HTTPException as http_err:
        print(f"HTTP Exception: {http_err.detail}")  # Log HTTP errors
        raise
    
    except Exception as e:
        print(f"Error during login: {e}")  # Log the error
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get information about the currently authenticated user."""
    return {"email": current_user["email"]}