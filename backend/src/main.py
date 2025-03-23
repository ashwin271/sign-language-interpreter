from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins; change this to specific domains for security
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)
# Import routes
from routes.translator import router as translator_router
from routes.video_gen import router as video_gen_router
from routes.auth import router as auth_router
from routes.tts import router as text_speech_router
from routes.gesture_recognition import router as gesture_router

# Include routers
app.include_router(translator_router)
app.include_router(auth_router)
app.include_router(video_gen_router)
app.include_router(text_speech_router)
app.include_router(gesture_router)

if __name__ == "__main__":
    import uvicorn  # type: ignore
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
