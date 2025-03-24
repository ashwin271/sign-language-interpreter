import os
import logging
import hashlib
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pathlib import Path
from typing import Dict, List, Optional
import shutil
from datetime import datetime, timedelta
from moviepy import VideoFileClip, concatenate_videoclips
import ollama
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Get the project root directory (assuming we're running from the backend folder)
PROJECT_ROOT = Path(os.path.abspath(os.path.dirname(__file__))).parent.parent

# Directories for video clips and final output
CLIP_DIR = PROJECT_ROOT / "assets" / "clips"
OUTPUT_DIR = PROJECT_ROOT / "assets" / "generated"
METADATA_FILE = OUTPUT_DIR / "metadata.json"

# Ensure directories exist
CLIP_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Cache to store previously generated videos
video_cache: Dict[str, str] = {}

def load_metadata() -> Dict:
    """Load metadata of generated videos from file."""
    if METADATA_FILE.exists():
        try:
            with open(METADATA_FILE, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            logger.error("Error parsing metadata file, creating new one")
            return {"videos": []}
    return {"videos": []}

def save_metadata(metadata: Dict) -> None:
    """Save metadata of generated videos to file."""
    with open(METADATA_FILE, 'w') as f:
        json.dump(metadata, f, indent=2)

def cleanup_old_videos(max_age_days: int = 7) -> None:
    """Remove videos older than the specified number of days."""
    metadata = load_metadata()
    current_time = datetime.now()
    updated_videos = []
    
    for video in metadata["videos"]:
        created_at = datetime.fromisoformat(video["created_at"])
        age = current_time - created_at
        
        if age > timedelta(days=max_age_days):
            video_path = OUTPUT_DIR / video["filename"]
            if video_path.exists():
                try:
                    os.remove(video_path)
                    logger.info(f"Removed old video: {video_path}")
                except Exception as e:
                    logger.error(f"Failed to remove {video_path}: {e}")
        else:
            updated_videos.append(video)
    
    metadata["videos"] = updated_videos
    save_metadata(metadata)

def get_available_words() -> List[str]:
    """Get a list of all available words that have video clips."""
    available_words = []
    for clip_path in CLIP_DIR.glob("*.mp4"):
        word = clip_path.stem  # Get filename without extension
        available_words.append(word)
    return available_words

def process_text(text: str) -> str:
    """Process text to map to available sign language clips while preserving meaning."""
    # Get list of available words
    available_words = get_available_words()
    
    try:
        # Create a more focused prompt for sign language conversion
        prompt = f"""You are a sign language translation expert. Your task is to convert natural language text into a sequence of words that can be represented in sign language videos.

Available sign language words: {', '.join(available_words)}

Follow these rules strictly:
1. ONLY use words from the available list above
2. Maintain the core meaning of the original text as much as possible
3. If exact words aren't available, find conceptually similar words from the available list
4. If no similar words exist, it's better to skip that concept than to use an unrelated word
5. NEVER substitute words with completely different meanings
6. Keep the natural order of concepts when possible
7. Focus on nouns, main verbs, adjectives, and adverbs that convey the key message
8. Output ONLY the final sequence of words separated by spaces, all lowercase
9. If you cannot find any appropriate words to convey the meaning, output "no_suitable_words_available"

IMPORTANT: Do not completely change the meaning of the text. If you can't find suitable words, it's better to return fewer words or "no_suitable_words_available" than to use words with unrelated meanings.

Original text: {text}
Sign language word sequence:"""

        response = ollama.chat(model="llama3.2", messages=[{"role": "user", "content": prompt}])
        
        processed_text = response["message"]["content"].strip()
        # Remove any quotes or extra formatting that might be in the response
        processed_text = processed_text.replace('"', '').replace("'", "").strip()
        
        # Check for the special "no suitable words" response
        if processed_text == "no_suitable_words_available":
            logger.warning(f"No suitable words available for: '{text}'")
            return ""
        
        # Verify that all words in the processed text are in the available words list
        processed_words = processed_text.split()
        final_words = []
        
        for word in processed_words:
            if word in available_words:
                final_words.append(word)
            else:
                logger.warning(f"Word '{word}' from Llama output not in available words list, skipping")
        
        final_text = " ".join(final_words)
        logger.info(f"Processed text: '{text}' -> '{final_text}'")
        
        # If no valid words were found, return empty string
        if not final_words:
            logger.warning("No valid words found in Llama output")
            return ""
            
        return final_text
    except Exception as e:
        logger.error(f"Error processing text with Llama: {e}")
        return ""

def basic_text_processing(text: str, available_words: List[str]) -> str:
    """Basic text processing as fallback when Llama processing fails."""
    words = text.lower().split()
    result = []
    
    for word in words:
        # Remove punctuation
        clean_word = ''.join(c for c in word if c.isalnum())
        
        if clean_word in available_words:
            result.append(clean_word)
        elif len(clean_word) > 1:
            # Try to find partial matches
            for available in available_words:
                if clean_word in available or available in clean_word:
                    result.append(available)
                    logger.info(f"Matched '{clean_word}' to available word '{available}'")
                    break
    
    return " ".join(result)

def map_text_to_clips(processed_text: str) -> List[VideoFileClip]:
    """Map each word in the processed text to a corresponding video clip."""
    words = processed_text.split()
    video_clips = []
    missing_words = []

    for word in words:
        clip_path = CLIP_DIR / f"{word}.mp4"
        if clip_path.exists():
            try:
                video_clips.append(VideoFileClip(str(clip_path)))
            except Exception as e:
                logger.error(f"Error loading clip for '{word}': {e}")
        else:
            missing_words.append(word)
            logger.warning(f"No clip found for '{word}'")

    if missing_words:
        logger.warning(f"Missing clips for words: {', '.join(missing_words)}")
    
    return video_clips

def generate_content_hash(text: str) -> str:
    """Generate a hash of the input text to use as a cache key."""
    return hashlib.md5(text.encode()).hexdigest()

def background_video_generation(text: str, content_hash: str) -> None:
    """Generate video in the background and update cache when done."""
    try:
        processed_text = process_text(text)
        video_clips = map_text_to_clips(processed_text)

        if not video_clips:
            logger.error(f"No matching clips found for text: {text}")
            return

        final_video = concatenate_videoclips(video_clips)
        
        # Save video with content hash in filename
        filename = f"video_{content_hash}.mp4"
        video_output = OUTPUT_DIR / filename
        final_video.write_videofile(str(video_output), fps=24)
        
        # Close video clips to free resources
        for clip in video_clips:
            clip.close()
        final_video.close()
        
        # Update metadata
        metadata = load_metadata()
        metadata["videos"].append({
            "filename": filename,
            "original_text": text,
            "processed_text": processed_text,
            "created_at": datetime.now().isoformat(),
            "content_hash": content_hash
        })
        save_metadata(metadata)
        
        # Update cache
        video_cache[content_hash] = f"/assets/generated/{filename}"
        
        logger.info(f"Successfully generated video: {filename}")
        
        # Clean up old videos
        cleanup_old_videos()
        
    except Exception as e:
        logger.error(f"Error in background video generation: {e}")

@router.post("")
async def generate_video(text: str, background_tasks: BackgroundTasks):
    """Generate an ISL video based on input text."""
    try:
        # Generate a hash of the input text
        content_hash = generate_content_hash(text)
        
        # Check if we already have this video
        if content_hash in video_cache:
            logger.info(f"Returning cached video for: {text}")
            return {"video_path": video_cache[content_hash], "cached": True}
        
        # Check metadata for existing video
        metadata = load_metadata()
        for video in metadata["videos"]:
            if video.get("content_hash") == content_hash:
                filename = video["filename"]
                video_path = OUTPUT_DIR / filename
                if video_path.exists():
                    video_cache[content_hash] = f"/assets/generated/{filename}"
                    logger.info(f"Found existing video in metadata: {filename}")
                    return {"video_path": f"/assets/generated/{filename}", "cached": True}
        
        # Process the text first to check if we have suitable words
        processed_text = process_text(text)
        
        # If no suitable words are available, return an error
        if not processed_text:
            return {
                "status": "error",
                "message": "No suitable sign language words available for this text. Try different wording.",
                "content_hash": content_hash
            }
        
        # Start background task for video generation
        background_tasks.add_task(background_video_generation, text, content_hash)
        
        return {
            "status": "processing",
            "message": "Video generation started. Check status endpoint for updates.",
            "content_hash": content_hash
        }

    except Exception as e:
        logger.error(f"Error in generate_video endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating video: {str(e)}")

@router.get("/status/{content_hash}")
async def check_video_status(content_hash: str):
    """Check the status of a video generation task."""
    if content_hash in video_cache:
        return {"status": "completed", "video_path": video_cache[content_hash]}
    
    # Check if the video exists in the output directory
    metadata = load_metadata()
    for video in metadata["videos"]:
        if video.get("content_hash") == content_hash:
            filename = video["filename"]
            return {"status": "completed", "video_path": f"/assets/generated/{filename}"}
    
    return {"status": "processing"}

@router.get("/list")
async def list_videos(limit: int = 10, offset: int = 0):
    """List generated videos with pagination."""
    metadata = load_metadata()
    videos = metadata["videos"]
    
    # Sort by creation date (newest first)
    videos.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    
    # Apply pagination
    paginated = videos[offset:offset+limit]
    
    return {
        "videos": paginated,
        "total": len(videos),
        "limit": limit,
        "offset": offset
    }

@router.delete("/{content_hash}")
async def delete_video(content_hash: str):
    """Delete a generated video by its content hash."""
    metadata = load_metadata()
    found = False
    
    for i, video in enumerate(metadata["videos"]):
        if video.get("content_hash") == content_hash:
            filename = video["filename"]
            video_path = OUTPUT_DIR / filename
            
            if video_path.exists():
                try:
                    os.remove(video_path)
                    logger.info(f"Deleted video: {filename}")
                except Exception as e:
                    logger.error(f"Failed to delete {video_path}: {e}")
                    raise HTTPException(status_code=500, detail=f"Failed to delete video file: {str(e)}")
            
            # Remove from metadata
            metadata["videos"].pop(i)
            save_metadata(metadata)
            
            # Remove from cache
            if content_hash in video_cache:
                del video_cache[content_hash]
            
            found = True
            break
    
    if not found:
        raise HTTPException(status_code=404, detail="Video not found")
    
    return {"status": "success", "message": "Video deleted successfully"}