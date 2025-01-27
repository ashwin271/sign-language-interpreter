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
venv\Scripts\activate

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