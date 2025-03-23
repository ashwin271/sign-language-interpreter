from fastapi import APIRouter

# Create a router instance
router = APIRouter()

from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
import uvicorn
import torch
import os
import torchaudio
from utils import build_model, generate_speech
import base64

app = FastAPI()

# Create output directory if it doesn't exist
OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Use GPU if available, otherwise fallback to CPU
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Initialize Kokoro TTS model
model = build_model(None, DEVICE)

@app.post("/tts")
async def tts(
    text: str = Query(..., description="Text to convert to speech"),
    voice: str = Query("af_bella", description="Voice model to use (e.g., af_bella, am_adam)"),
    lang: str = Query("a", description="Language code: 'a' for American, 'b' for British"),
    speed: float = Query(1.0, description="Speech speed (0.5-2.0)")
):
    """TTS endpoint: Converts text to speech and returns audio as Base64"""
    try:
        # Generate speech
        audio_tensor, _ = generate_speech(model, text, voice, lang, DEVICE, speed)

        if audio_tensor is None:
            return JSONResponse(status_code=500, content={"error": "Failed to generate speech"})

        # Save audio as WAV file
        output_path = os.path.join(OUTPUT_DIR, "output.wav")
        torchaudio.save(output_path, audio_tensor.unsqueeze(0), 24000)

        # Convert the audio to Base64
        with open(output_path, "rb") as audio_file:
            audio_base64 = base64.b64encode(audio_file.read()).decode('utf-8')

        # Return Base64-encoded audio
        return JSONResponse(content={
            "audio": f"data:audio/wav;base64,{audio_base64}"
        })

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
