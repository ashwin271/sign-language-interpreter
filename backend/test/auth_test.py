from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import timedelta, datetime
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel
import logging
from fastapi.security import OAuth2PasswordBearer
from starlette.middleware.base import BaseHTTPMiddleware

# FastAPI app
app = FastAPI()
router = APIRouter()

# Database Configuration
DATABASE_URL = "sqlite:///./users.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Secret Key & Algorithm for JWT
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Logger Configuration
logging.basicConfig(level=logging.INFO)

# OAuth2 Password Bearer for Authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")  # Changed from "login" to "token"

# User Database Model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

Base.metadata.create_all(bind=engine)

# Pydantic Models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

# Dependency to Get DB Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Helper Functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        print("Decoded JWT Payload:", payload)  # Debugging

        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError as e:
        print("JWT Decode Error:", str(e))  # Log JWT error
        raise credentials_exception
    
    user = db.query(User).filter(User.username == token_data.username).first()
    print("User Found in DB:", user)  # Debugging

    if user is None:
        raise credentials_exception
    return user

# Middleware to log requests and responses
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        logging.info(f"Incoming request: {request.method} {request.url}")
        response = await call_next(request)
        logging.info(f"Response status: {response.status_code}")
        return response

app.add_middleware(LoggingMiddleware)

# Signup Route
@router.post("/signup", response_model=dict)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_password = hash_password(user.password)
    new_user = User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)  # Ensure the new user is properly saved

    return {"message": "User created successfully"}

# Login Route
@router.post("/token", response_model=Token)  # Changed from "/login" to "/token"
async def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    # Generate access token
    access_token = create_access_token(data={"sub": db_user.username}, expires_delta=timedelta(minutes=30))
    print("Generated Access Token:", access_token)  # Debugging

    return {"access_token": access_token, "token_type": "bearer"}

# Protected Route - Get Current User Info
@router.get("/me", response_model=dict)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {"username": current_user.username, "email": current_user.email}

# Include Router
app.include_router(router)

