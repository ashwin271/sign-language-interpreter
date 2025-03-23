import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import os

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.5)

# Define model directory
MODEL_DIR = "model"
os.makedirs(MODEL_DIR, exist_ok=True)  # Create model directory if it doesn't exist

# Define dataset file names with paths
DATA_FILE = os.path.join(MODEL_DIR, "gesture_data.npy")
LABEL_FILE = os.path.join(MODEL_DIR, "gesture_labels.npy")
LABEL_MAP_FILE = os.path.join(MODEL_DIR, "gesture_label_map.npy")
MODEL_FILE = os.path.join(MODEL_DIR, "gesture_model.h5")

# Number of samples per gesture
SAMPLES = 100

# Load existing data if available
if os.path.exists(DATA_FILE) and os.path.exists(LABEL_FILE):
    landmark_data = np.load(DATA_FILE, allow_pickle=True)
    labels = np.load(LABEL_FILE, allow_pickle=True)
    print(f"Loaded existing dataset with {len(labels)} samples and {len(np.unique(labels))} gestures")
else:
    landmark_data = np.empty((0, 42))  # 21 landmarks * (x, y)
    labels = np.array([])

# Start capturing gestures
cap = cv2.VideoCapture(0)

while True:
    gesture_name = input("\nEnter gesture name (or type 'exit' to stop): ")
    if gesture_name.lower() == 'exit':
        break

    print(f"Recording gesture '{gesture_name}'... Perform it in front of the camera.")
    print(f"Collecting {SAMPLES} samples. Press 'q' to stop early.")
    temp_data = []  # Store data for this gesture
    
    count = 0
    while count < SAMPLES:
        ret, frame = cap.read()
        if not ret:
            print("Error: Cannot read from webcam.")
            break

        # Add a counter display to the frame
        cv2.putText(frame, f"Samples: {count}/{SAMPLES}", (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = hands.process(frame_rgb)

        if result.multi_hand_landmarks:
            for hand_landmarks in result.multi_hand_landmarks:
                landmarks = []
                for lm in hand_landmarks.landmark:
                    landmarks.extend([lm.x, lm.y])  # Store x, y

                if len(landmarks) == 42:  # Ensure we have the correct number of landmarks
                    temp_data.append(landmarks)
                    count += 1
                    print(f"\rSample {count}/{SAMPLES}", end="")

                mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

        cv2.imshow("Recording Gesture", frame)

        if cv2.waitKey(1) & 0xFF == ord("q") or count >= SAMPLES:
            break

    if temp_data:  # Only append if we collected data
        # Append new data
        temp_data = np.array(temp_data)
        landmark_data = np.vstack((landmark_data, temp_data))
        labels = np.append(labels, [gesture_name] * len(temp_data))

        print(f"\nGesture '{gesture_name}' recorded successfully with {len(temp_data)} samples!")
    else:
        print("\nNo hand detected. Try again.")

# Save dataset
np.save(DATA_FILE, landmark_data)
np.save(LABEL_FILE, labels)
cap.release()
cv2.destroyAllWindows()

print("\nTraining model...")
print(f"Dataset contains {len(labels)} samples with {len(np.unique(labels))} unique gestures")

# Encode labels
label_encoder = LabelEncoder()
numeric_labels = label_encoder.fit_transform(labels)

# Save the label mapping for later use
unique_labels = label_encoder.classes_
# Create a label map ensuring all indices from 0 to max_index are included
max_index = len(unique_labels) - 1
label_map = {i: unique_labels[i] for i in range(max_index + 1)}
np.save(LABEL_MAP_FILE, label_map)

print(f"Label mapping: {label_map}")
print(f"Number of classes: {max_index + 1}")

# Split data into training and validation set
X_train, X_test, y_train, y_test = train_test_split(
    landmark_data, numeric_labels, test_size=0.2, random_state=42
)

# Build the model
num_classes = max_index + 1  # Ensure we have the correct number of output classes
print(f"Training model with {num_classes} classes")

model = Sequential([
    Dense(128, activation='relu', input_shape=(42,)),
    Dropout(0.2),
    Dense(64, activation='relu'),
    Dropout(0.2),
    Dense(num_classes, activation='softmax')  # Output layer with correct number of classes
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# Train model
model.fit(
    X_train, y_train,
    epochs=50,
    batch_size=32,
    validation_data=(X_test, y_test)
)

# Save model
model.save(MODEL_FILE)
print(f"Model trained and saved successfully to {MODEL_FILE}!")