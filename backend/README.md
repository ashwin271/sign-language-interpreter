# Backend server

## How to install dependencies?

1. Create virtual environment
```shell
cd path/to/your/project
python -m venv venv
```

2. Activate the virtual environment:
```shell
# Windows:
venv/Scripts/activate

# macOS/Linux:
source venv/bin/activate
```

3. Pip install dependencies
```shell
pip install -r requirements.txt
```

4. Install ffmpeg
```shell
# on Ubuntu or Debian
sudo apt update && sudo apt install ffmpeg

# on Windows using Scoop (install scoop from this link https://scoop.sh/)
scoop install ffmpeg 
```

5. Ensure `data/clips` and `static/videos` directories exist for video processing.

---

## ✅ **Text-to-Speech (TTS) Instructions**

### 1. **TTS Endpoint**
```
POST /tts
```

### 2. **Request Format**
```json
{
    "text": "Hello, welcome to the sign language interpreter."
}
```

### 3. **Output**
- The generated `.wav` audio file will be saved in:
```
backend/src/backend/static/audio
```
- The server will return the URL to the generated `.wav` file.

✅ **Example Response:**
```json
{
    "audio_url": "http://localhost:8000/static/audio/output_1710801234.wav"
}
```

---

## How to run?

1. Go to `/src`
```
cd sign-language-interpreter/backend/src
```

2. Activate virtual environment

3. Run main.py
```
python main.py
```

4. Video generation will use clips from `data/clips` and save outputs in `static/videos`.
```shell
# Output videos are stored in:
backend/static/videos/
```
