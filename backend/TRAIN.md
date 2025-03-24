# Gesture Recognition Model Training Guide

This document provides detailed instructions for training the gesture recognition model used in the sign language interpreter.

## Prerequisites

### CUDA Requirements

The training process requires CUDA for GPU acceleration.

- **Required CUDA Version**: 12.x or higher
- **Check your CUDA version**:
  ```shell
  nvidia-smi
  ```

### cuDNN Requirements

cuDNN is required for deep learning operations.

- **Required cuDNN Version**: 9.3 (specifically for TensorFlow 2.19.0)
- **Check your cuDNN version**:
  ```shell
  dpkg -l | grep -i cudnn
  ```

## Environment Setup

### Library Path Configuration

Before running the training script, you must set the library path:

```shell
export LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH
```

This step is **mandatory** - the training script will not work without it.

## Training Process

### Running the Training Script

```shell
# Activate your environment first
# For conda
conda activate sign-lang
# For venv (Windows)
venv\Scripts\activate
# For venv (macOS/Linux)
source venv/bin/activate

# Run the training script
python src/train_gesture.py
```

### Training Workflow

1. You'll be prompted to enter gesture names (e.g., "hello", "thank you")
2. For each gesture:
   - Position yourself in front of the webcam
   - The system will collect 100 samples of your gesture
   - Perform the gesture naturally with slight variations
   - Press 'q' to stop collection early if needed
3. Type 'exit' when you've finished adding all gestures
4. The model will train automatically using the collected data

### Output Files

After training completes, the following files will be created in the `model` directory:

- `gesture_data.npy` - Raw gesture data
- `gesture_labels.npy` - Gesture class labels
- `gesture_label_map.npy` - Mapping between label indices and gesture names
- `gesture_model.h5` - Trained model file

## Troubleshooting

- **CUDA/cuDNN Errors**: Ensure your CUDA and cuDNN versions match the requirements
- **Memory Errors**: Reduce batch size if you encounter GPU memory issues
- **Poor Recognition**: Try training with more varied samples or in different lighting conditions
- **Camera Issues**: Verify your webcam is properly connected and accessible

## Advanced Configuration

For advanced users, you can modify training parameters in the `train_gesture.py` script:

- Sample count per gesture
- Model architecture
- Training epochs
- Learning rate

Remember to back up your existing model files before retraining if you want to preserve them.