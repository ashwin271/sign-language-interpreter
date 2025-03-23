from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import cv2
import mediapipe as mp
import numpy as np
import tensorflow as tf
import base64
import json
import os
import time

router = FastAPI()

# Load trained model with path relative to the routes directory

# Get the absolute path to the backend directory
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Define paths relative to backend directory
model_path = os.path.join(backend_dir, "model", "gesture_model.h5")
label_map_path = os.path.join(backend_dir, "model", "gesture_label_map.npy")
labels_path = os.path.join(backend_dir, "model", "gesture_labels.npy")

# Load the model
model = tf.keras.models.load_model(model_path)

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

@router.get("/")
def read_root():
    return {"message": "Gesture Recognition API is running. Connect to /ws with WebSocket."}

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket Connection Established")
    
    # Print the label map to debug
    print(f"Using label map: {label_map}")
    print(f"Number of classes in model: {model.output_shape[1]}")
    
    # Verify model output matches label map
    if model.output_shape[1] != len(label_map):
        print(f"Warning: Model has {model.output_shape[1]} output classes, but label map has {len(label_map)} entries!")

    # Variables for tracking gesture sequence
    gesture_sequence = []
    last_gesture = None
    last_gesture_time = time.time()
    current_gesture_start_time = None
    no_gesture_start_time = None
    sequence_complete = False
    
    # Minimum time a gesture needs to be held (in seconds) - reduced to 0.25
    GESTURE_HOLD_TIME = 0.25

    try:
        while True:
            try:
                data = await websocket.receive_text()
            except WebSocketDisconnect:
                print("Client disconnected")
                break

            if "," not in data:
                continue  # Skip invalid data
            
            _, img_data = data.split(",", 1)  # Handle base64 data properly
            img_data = base64.b64decode(img_data)
            np_arr = np.frombuffer(img_data, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if frame is None:
                continue

            current_time = time.time()
            
            # Process frame
            frame = cv2.flip(frame, 1)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = hands.process(rgb_frame)

            gesture_detected = False
            response = {
                "gesture": "Waiting...", 
                "confidence": 0.0, 
                "mode": "recording",
                "sequence": gesture_sequence,
                "sequence_complete": sequence_complete
            }

            if result.multi_hand_landmarks:
                for hand_landmarks in result.multi_hand_landmarks:
                    # Extract landmarks in the correct format
                    landmarks = []
                    for lm in hand_landmarks.landmark:
                        landmarks.extend([lm.x, lm.y])  # Store x, y
                    
                    # Ensure we have the correct number of landmarks
                    if len(landmarks) != 42:
                        continue
                        
                    landmarks = np.array(landmarks).reshape(1, -1)

                    # Get predictions
                    prediction = model.predict(landmarks, verbose=0)
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
                            "mode": "recording",
                            "sequence": gesture_sequence,
                            "sequence_complete": sequence_complete
                        }
                        
                        # Handle the gesture timing
                        if gesture_name != last_gesture:
                            # New gesture detected
                            current_gesture_start_time = current_time
                            last_gesture = gesture_name
                        elif current_gesture_start_time is not None:
                            # Same gesture continued
                            if (current_time - current_gesture_start_time >= GESTURE_HOLD_TIME and 
                                gesture_name != "Gesture Unidentified" and
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
                            "gesture": "Gesture Unidentified",
                            "confidence": round(confidence, 2),
                            "mode": "recording",
                            "sequence": gesture_sequence,
                            "sequence_complete": sequence_complete
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
                        "mode": "recording",
                        "sequence": gesture_sequence,
                        "sequence_complete": True
                    }
                    
                # Reset last_gesture if it's been more than 2 seconds since the last gesture
                if current_time - last_gesture_time > 2.0:
                    last_gesture = None
            
            await websocket.send_text(json.dumps(response))

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

    finally:
        print("WebSocket Connection Closed")
        await websocket.close()