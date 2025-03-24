from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from pathlib import Path

# Import database initialization
from database.db import init_db

# Define project root and asset directories
PROJECT_ROOT = Path(os.path.abspath(os.path.dirname(__file__))).parent
ASSETS_DIR = PROJECT_ROOT / "assets"
GENERATED_DIR = ASSETS_DIR / "generated"

# Ensure directories exist
ASSETS_DIR.mkdir(parents=True, exist_ok=True)
GENERATED_DIR.mkdir(parents=True, exist_ok=True)

# Define lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize the database
    init_db()
    print("Database initialized")
    yield
    # Shutdown: Clean up resources if needed
    print("Shutting down application")

# Create FastAPI app with lifespan
app = FastAPI(lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins; change this to specific domains for security
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

# Mount static directories for serving video files
app.mount("/assets/generated", StaticFiles(directory=str(GENERATED_DIR)), name="generated_videos")

# Import routes
from routes.transcription import router as transcription_router
from routes.video_gen import router as video_gen_router
from routes.auth import router as auth_router
from routes.tts import router as speech_router
from routes.gesture_recognition import router as gesture_router

# Include routers
app.include_router(transcription_router, prefix="/transcribe")
app.include_router(auth_router, prefix="/auth")
app.include_router(video_gen_router, prefix="/video")
app.include_router(speech_router, prefix="/tts")
app.include_router(gesture_router, prefix="/gesture")

if __name__ == "__main__":
    import uvicorn  # type: ignore
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)