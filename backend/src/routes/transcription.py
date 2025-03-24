from fastapi import APIRouter, HTTPException, UploadFile, File
import whisper
import os

# Create a router instance
router = APIRouter()

# Load the Whisper model once when the application starts
model = whisper.load_model("tiny")

@router.post("")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        # Save the uploaded audio file temporarily
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb") as f:
            f.write(await file.read())

        # Use Whisper model to transcribe the audio file
        result = model.transcribe(file_location)

        # Clean up temporary file
        os.remove(file_location)

        # Return the transcription result
        return {"transcription": result["text"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")