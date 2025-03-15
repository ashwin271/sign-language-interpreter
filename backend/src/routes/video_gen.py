from fastapi import APIRouter, HTTPException
from pathlib import Path
from moviepy import VideoFileClip, concatenate_videoclips
import ollama
from datetime import datetime

router = APIRouter()

# Directories for video clips and final output
CLIP_DIR = Path("backend/data/clips")
OUTPUT_DIR = Path("backend/static/videos")

# Ensure directories exist
CLIP_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def process_text(text: str) -> str:
    """Process text using Llama 3.2 to remove unnecessary words while maintaining order."""
    response = ollama.chat(model="llama3.2", messages=[{"role": "user", "content": 
        f"Process the following text by strictly following these rules:\n"
        f"- Remove all special characters, punctuation, and numbers.\n"
        f"- Remove conjunctions like and but or so.\n"
        f"- Remove prepositions like to from with at by.\n"
        f"- Remove auxiliary verbs like is am are was were has have had.\n"
        f"- Keep only the essential words present in the text, without adding anything new.\n"
        f"- Do not change the order of words.\n"
        f"- The output should be entirely lowercase and should not contain quotes or extra formatting.\n\n"
        f"Process this text:\n{text}"}])
    
    return response["message"]["content"].strip()

def map_text_to_clips(processed_text: str):
    """Map each word in the processed text to a corresponding video clip."""
    words = processed_text.split()
    video_clips = []

    for word in words:
        clip_path = CLIP_DIR / f"{word}.mp4"
        if clip_path.exists():
            video_clips.append(VideoFileClip(str(clip_path)))
        else:
            print(f"Warning: No clip found for '{word}'")

    return video_clips

@router.post("/generate_video/")
async def generate_video(text: str):
    """Generate an ISL video based on input text."""
    try:
        processed_text = process_text(text)
        video_clips = map_text_to_clips(processed_text)

        if not video_clips:
            raise HTTPException(status_code=400, detail="No matching clips found for the given text.")

        final_video = concatenate_videoclips(video_clips)
        
        # Save video with timestamped filename
        filename = f"video_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4"
        video_output = OUTPUT_DIR / filename
        final_video.write_videofile(str(video_output), fps=24)

        return {"video_path": f"/static/videos/{filename}"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating video: {str(e)}")
