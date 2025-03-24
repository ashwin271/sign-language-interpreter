from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException
import cv2
import mediapipe as mp
import numpy as np
import tensorflow as tf
import base64
import json
import os
import time
from typing import List, Dict, Optional

# Configure TensorFlow to use less GPU memory
gpus = tf.config.experimental.list_physical_devices('GPU')
if gpus:
    try:
        # Limit TensorFlow to only use a fraction of GPU memory
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        print("GPU memory growth enabled")
    except RuntimeError as e:
        print(f"GPU configuration error: {e}")

# Create router instead of app
from fastapi import APIRouter

router = APIRouter()

# Load trained model with path relative to the routes directory
# Get the absolute path to the backend directory
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Define paths relative to backend directory
model_path = os.path.join(backend_dir, "model", "gesture_model.h5")
label_map_path = os.path.join(backend_dir, "model", "gesture_label_map.npy")
labels_path = os.path.join(backend_dir, "model", "gesture_labels.npy")

# Load the model and convert to TFLite
print(f"Loading model from {model_path}")
keras_model = tf.keras.models.load_model(model_path)

# Convert model to TensorFlow Lite for better performance and lower memory usage
converter = tf.lite.TFLiteConverter.from_keras_model(keras_model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

# Load the TFLite model
interpreter = tf.lite.Interpreter(model_content=tflite_model)
interpreter.allocate_tensors()

# Get input and output tensors
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

print(f"Model loaded and converted to TFLite. Input shape: {input_details[0]['shape']}, Output shape: {output_details[0]['shape']}")

# Load label map
if os.path.exists(label_map_path):
    label_map = np.load(label_map_path, allow_pickle=True).item()
    print(f"Loaded label map: {label_map}")
    
    # Verify all indices from 0 to max_index are present
    max_index = max(label_map.keys())
    for i in range(max_index + 1):
        if i not in label_map:
            print(f"Warning: Index {i} is missing from label map!")
else:
    print(f"Warning: Label map file not found at {label_map_path}!")
    # Fallback to unique labels in the dataset
    if os.path.exists(labels_path):
        labels = np.load(labels_path, allow_pickle=True)
        unique_labels = list(set(labels))
        label_map = {i: label for i, label in enumerate(unique_labels)}
    else:
        print(f"Warning: Labels file not found at {labels_path}!")
        label_map = {}  # Empty fallback

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.5)

# Constants
GESTURE_HOLD_TIME = 1.0  # Time in seconds to hold a gesture before adding to sequence

@router.get("/")
def read_root():
    return {"message": "Gesture Recognition API is running. Connect to /ws with WebSocket."}

@router.post("/process-video")
async def process_video(video: UploadFile = File(...)):
    """Process an uploaded video file for sign language recognition"""
    if not video.filename.endswith(('.mp4', '.avi', '.mov', '.webm')):
        raise HTTPException(status_code=400, detail="Invalid video format. Please upload MP4, AVI, MOV, or WEBM file.")
    
    # Save the uploaded file temporarily
    temp_file = f"/tmp/{video.filename}"
    with open(temp_file, "wb") as buffer:
        buffer.write(await video.read())
    
    try:
        # Process the video
        cap = cv2.VideoCapture(temp_file)
        
        if not cap.isOpened():
            raise HTTPException(status_code=500, detail="Failed to open video file")
        
        # Variables for tracking gesture sequence
        gesture_sequence: List[str] = []
        last_gesture: Optional[str] = None
        gesture_counts: Dict[str, int] = {}
        
        # Process frames
        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            # Process every 5th frame to reduce computation
            if frame_count % 5 != 0:
                frame_count += 1
                continue
                
            # Process the frame
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(frame_rgb)
            
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    # Extract landmarks
                    landmarks = []
                    for lm in hand_landmarks.landmark:
                        landmarks.extend([lm.x, lm.y])  # Store x, y
                    
                    # Ensure we have the correct number of landmarks
                    if len(landmarks) != 42:
                        continue
                        
                    landmarks = np.array(landmarks).reshape(1, -1).astype(np.float32)

                    # Get predictions using TFLite
                    interpreter.set_tensor(input_details[0]['index'], landmarks)
                    interpreter.invoke()
                    prediction = interpreter.get_tensor(output_details[0]['index'])
                    
                    gesture_id = int(np.argmax(prediction))
                    confidence = float(prediction[0][gesture_id])
                    
                    # Get gesture name from the label map
                    gesture_name = label_map.get(gesture_id, "Unknown")
                    
                    if confidence > 0.6 and gesture_name != "Unknown":
                        # Count occurrences of each gesture
                        if gesture_name not in gesture_counts:
                            gesture_counts[gesture_name] = 0
                        gesture_counts[gesture_name] += 1
            
            frame_count += 1
        
        cap.release()
        
        # Determine the most frequent gestures
        for gesture, count in sorted(gesture_counts.items(), key=lambda x: x[1], reverse=True):
            if count > 5:  # Threshold to consider a gesture valid
                gesture_sequence.append(gesture)
        
        # Clean up the temporary file
        os.remove(temp_file)
        
        return {
            "text": " ".join(gesture_sequence),
            "sequence": gesture_sequence
        }
        
    except Exception as e:
        # Clean up the temporary file if it exists
        if os.path.exists(temp_file):
            os.remove(temp_file)
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connection accepted")
    
    # Variables for tracking gesture sequence
    gesture_sequence: List[str] = []
    last_gesture: Optional[str] = None
    current_gesture_start_time: Optional[float] = None
    no_gesture_start_time: Optional[float] = None
    last_gesture_time: float = time.time()
    sequence_complete: bool = False
    
    try:
        while True:
            # Receive frame from client
            data = await websocket.receive_bytes()
            
            # Convert bytes to numpy array
            nparr = np.frombuffer(data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                continue
                
            # Process the frame
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(frame_rgb)
            
            current_time = time.time()
            gesture_detected = False
            
            response = {
                "gesture": "Waiting...",
                "confidence": 0.0,
                "sequence": gesture_sequence,
                "text": " ".join(gesture_sequence) if gesture_sequence else ""
            }
            
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    # Extract landmarks
                    landmarks = []
                    for lm in hand_landmarks.landmark:
                        landmarks.extend([lm.x, lm.y])  # Store x, y
                    
                    # Ensure we have the correct number of landmarks
                    if len(landmarks) != 42:
                        continue
                        
                    landmarks = np.array(landmarks).reshape(1, -1).astype(np.float32)

                    # Get predictions using TFLite
                    interpreter.set_tensor(input_details[0]['index'], landmarks)
                    interpreter.invoke()
                    prediction = interpreter.get_tensor(output_details[0]['index'])
                    
                    gesture_id = int(np.argmax(prediction))
                    confidence = float(prediction[0][gesture_id])
                    
                    # Get gesture name from the label map
                    gesture_name = label_map.get(gesture_id, "Unknown")
                    
                    print(f"Predicted: {gesture_name} (ID: {gesture_id}) with confidence: {confidence:.2f}")
                    
                    # Modified logic for classification
                    if confidence > 0.6:
                        gesture_detected = True
                        
                        # If we had a sequence complete, start a new one when a new gesture is detected
                        if sequence_complete and gesture_name != last_gesture:
                            gesture_sequence = []
                            sequence_complete = False
                        
                        response = {
                            "gesture": gesture_name,
                            "confidence": round(confidence, 2),
                            "sequence": gesture_sequence,
                            "text": " ".join(gesture_sequence) if gesture_sequence else ""
                        }
                        
                        # Handle the gesture timing
                        if gesture_name != last_gesture:
                            # New gesture detected
                            current_gesture_start_time = current_time
                            last_gesture = gesture_name
                        elif current_gesture_start_time is not None:
                            # Same gesture continued
                            if (current_time - current_gesture_start_time >= GESTURE_HOLD_TIME and 
                                gesture_name != "Unknown" and
                                (not gesture_sequence or gesture_sequence[-1] != gesture_name)):
                                # Gesture held long enough, add to sequence if not already the last one
                                print(f"Adding {gesture_name} to sequence (held for {current_time - current_gesture_start_time:.2f}s)")
                                gesture_sequence.append(gesture_name)
                                # Reset the timer for this gesture
                                current_gesture_start_time = None
                        
                        # Reset no-gesture timer
                        no_gesture_start_time = None
                        last_gesture_time = current_time
                    else:
                        response = {
                            "gesture": "Unknown",
                            "confidence": round(confidence, 2),
                            "sequence": gesture_sequence,
                            "text": " ".join(gesture_sequence) if gesture_sequence else ""
                        }

            # If no gesture is detected for 3 seconds and we have gestures in the sequence, mark sequence as complete
            if not gesture_detected:
                current_gesture_start_time = None  # Reset the current gesture timer
                
                if no_gesture_start_time is None:
                    no_gesture_start_time = current_time
                elif current_time - no_gesture_start_time >= 3.0 and len(gesture_sequence) > 0 and not sequence_complete:
                    print(f"Sequence complete: {gesture_sequence}")
                    sequence_complete = True
                    response = {
                        "gesture": "Waiting...",
                        "confidence": 0.0,
                        "sequence": gesture_sequence,
                        "text": " ".join(gesture_sequence) if gesture_sequence else "",
                        "sequence_complete": True
                    }
                    
                # Reset last_gesture if it's been more than 2 seconds since the last gesture
                if current_time - last_gesture_time > 2.0:
                    last_gesture = None
            
            await websocket.send_text(json.dumps(response))

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        print("WebSocket Connection Closed")
        # Don't try to close the connection here, it's already closed