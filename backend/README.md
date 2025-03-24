# Backend Server for Sign Language Interpreter

This backend server provides APIs for sign language interpretation, text-to-speech conversion, and gesture recognition.

## Setup Instructions

### 1. Set Up Python Environment

#### Option A: Using Conda (Recommended)

```shell
# Create a new conda environment with Python 3.12
conda create -n sign-lang python=3.12

# Activate the environment
conda activate sign-lang
```

#### Option B: Using venv

```shell
# Create a new virtual environment
python -m venv venv

# Activate the environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

### 2. Install Dependencies

```shell
# Install Python dependencies
pip install -r requirements.txt
```

### 3. Install FFmpeg

FFmpeg is required for video processing:

```shell
# on Ubuntu or Debian
sudo apt update && sudo apt install ffmpeg

# on macOS with Homebrew
brew install ffmpeg

# on Windows using Scoop (install scoop from https://scoop.sh/)
scoop install ffmpeg 

# on Windows using Chocolatey (install chocolatey from https://chocolatey.org/)
choco install ffmpeg
```

### 4. Train Gesture Recognition Model 

To train your own gesture recognition model:

```shell
# Activate your environment
# For conda
conda activate sign-lang
# For venv (Windows)
venv\Scripts\activate
# For venv (macOS/Linux)
source venv/bin/activate

# Run the training script
python src/train_gesture.py
```

During training:
- You'll be prompted to enter gesture names
- For each gesture, perform the sign in front of your webcam
- The system will collect 100 samples per gesture
- Press 'q' to stop collection early
- Type 'exit' when you've finished adding all gestures

The trained model will be saved in the `model` directory.

>**Note:** For detailed instructions on training, including GPU requirements and troubleshooting, see [TRAIN.md](TRAIN.md).

### 5. Directory Structure

This will be your directory structure after running the backend once:

```py
backend/
├── assets
│   ├── clips
│   │   └── <word_name>.mp4 # here clips are stored with file name as the word name
│   └── generated
│       ├── metadata.json # metadata of generated videos
│       └── video_b2489a92199c126ce1dd899bb3fdf3d1.mp4 # generated videos
├── config.json # kokoro config
├── data
│   └── db
│       └── app.db # sqlite db file
├── kokoro-v1_0.pth # kokoro model
├── model # gesture recognition model files
│   ├── gesture_data.npy
│   ├── gesture_label_map.npy
│   ├── gesture_labels.npy
│   └── gesture_model.h5
├── outputs 
│   └── <generated_audio>.wav # tts model outputs
├── README.md
├── requirements.txt
├── src
│   ├── database
│   │   └── db.py
│   ├── main.py
│   ├── routes 
│   │   ├── auth.py
│   │   ├── gesture_recognition.py
│   │   ├── __init__.py
│   │   ├── transcription.py
│   │   ├── tts.py
│   │   ├── utils.py
│   │   └── video_gen.py
│   └── train_gesture.py # gesture recognition model training 
├── test
│   ├── gesture.html
│   └── gesture_test.html
├── TRAIN.md # info on training gesture recognition model
└── voices # kokoro voices
    └── zf_xiaoyi.pt 
```

## Running the Server

```shell
# Activate your environment
# For conda
conda activate sign-lang
# For venv (Windows)
venv\Scripts\activate
# For venv (macOS/Linux)
source venv/bin/activate

# Navigate to the backend directory
cd backend

# Run the server
python src/main.py
```

The server will start on http://127.0.0.1:8000


## Troubleshooting

- **Model Training Issues**: Ensure your webcam is working properly and well-lit for gesture recognition training.
- **Video Generation**: Check that the `assets/clips` directory contains video clips for the words you're trying to generate.
- **FFmpeg Errors**: Verify FFmpeg is correctly installed and accessible in your PATH.
- **Environment Issues**: If you encounter environment-related errors, try creating a fresh environment and reinstalling dependencies.
