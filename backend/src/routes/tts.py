from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import uvicorn
import torch
import os
import torchaudio
from .utils import build_model, generate_speech
import base64
import scipy.io.wavfile as wavfile
import ollama
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create a router instance
router = APIRouter()

# Create output directory if it doesn't exist
OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Use GPU if available, otherwise fallback to CPU
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Initialize Kokoro TTS model
model = build_model(None, DEVICE)

@router.post("/convert")
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

        # Convert the audio tensor to numpy array
        audio_numpy = audio_tensor.cpu().numpy()
        
        # Save audio as WAV file using scipy instead of torchaudio
        output_path = os.path.join(OUTPUT_DIR, "output.wav")
        wavfile.write(output_path, 24000, audio_numpy)

        # Convert the audio to Base64
        with open(output_path, "rb") as audio_file:
            audio_base64 = base64.b64encode(audio_file.read()).decode('utf-8')

        # Return Base64-encoded audio
        return JSONResponse(content={
            "audio": f"data:audio/wav;base64,{audio_base64}"
        })

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.post("/sign-to-speech")
async def sign_to_speech(
    words: list = Query(..., description="List of sign language words to convert to natural language and then speech"),
    voice: str = Query("af_bella", description="Voice model to use (e.g., af_bella, am_adam)"),
    lang: str = Query("a", description="Language code: 'a' for American, 'b' for British"),
    speed: float = Query(1.0, description="Speech speed (0.5-2.0)")
):
    """Converts sign language words to natural language and then to speech"""
    try:
        # Check if we have any words
        if not words:
            return JSONResponse(status_code=400, content={"error": "No words provided"})
        
        # Join words into a space-separated string
        word_sequence = " ".join(words)
        logger.info(f"Converting word sequence to natural language: {word_sequence}")
        
        # Use Ollama to convert word sequence to natural language
        prompt = f"""You are a sign language interpreter. Convert the following sequence of sign language words into natural, 
        fluent English. Maintain the meaning while making it grammatically correct and natural sounding.
        
        Sign language word sequence: {word_sequence}
        
        Your response should only contain the converted sentence. No extra texts or formatting required"""
        
        try:
            response = ollama.chat(model="llama3.2", messages=[{"role": "user", "content": prompt}])
            natural_text = response["message"]["content"].strip()
            
            # Clean up the response (remove quotes if present)
            natural_text = natural_text.replace('"', '').replace("'", "").strip()
            logger.info(f"Generated natural language: {natural_text}")
            
        except Exception as e:
            logger.error(f"Error using Ollama for natural language generation: {e}")
            # Fallback to the original word sequence if Ollama fails
            natural_text = word_sequence
            
        # Generate speech from the natural language text
        audio_tensor, _ = generate_speech(model, natural_text, voice, lang, DEVICE, speed)

        if audio_tensor is None:
            return JSONResponse(status_code=500, content={"error": "Failed to generate speech"})

        # Convert the audio tensor to numpy array
        audio_numpy = audio_tensor.cpu().numpy()
        
        # Save audio as WAV file
        output_path = os.path.join(OUTPUT_DIR, "sign_speech_output.wav")
        wavfile.write(output_path, 24000, audio_numpy)

        # Convert the audio to Base64
        with open(output_path, "rb") as audio_file:
            audio_base64 = base64.b64encode(audio_file.read()).decode('utf-8')

        # Return both the natural language text and the Base64-encoded audio
        return JSONResponse(content={
            "text": natural_text,
            "audio": f"data:audio/wav;base64,{audio_base64}"
        })

    except Exception as e:
        logger.error(f"Error in sign-to-speech endpoint: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})