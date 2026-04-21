from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
from PIL import Image
import io
import tensorflow as tf # 👈 Asli AI ke liye TensorFlow add kiya

# ===============================
# CREATE APP
# ===============================
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ===============================
# LOAD MODELS & COLUMNS
# ===============================
# 1. Symptom Model (Tabular Data)
symptom_model = pickle.load(open("animal_disease_model.pkl", "rb"))
columns = pickle.load(open("columns.pkl", "rb"))

# 2. Image Model (TensorFlow/Keras)
print("Loading Deep Learning Image Model... Please wait ⏳")
image_model = tf.keras.models.load_model('animal_disease_model.keras')

# 3. Image Classes load karna (Fever, Healthy, Injury, Skin_Infection)
with open('class_names.pkl', 'rb') as f:
    image_class_names = pickle.load(f)
print("Image Classes Loaded:", image_class_names)

# MobileNetV2 ka preprocessor
preprocess_input = tf.keras.applications.mobilenet_v2.preprocess_input

# ===============================
# HOME ROUTE
# ===============================
@app.route("/")
def home():
    return "✅ Animal Disease Prediction API Running with Real AI Model!"

# ===============================
# METADATA ROUTE (Dropdown Data)
# ===============================
@app.route("/metadata", methods=["GET"])
def metadata():
    symptoms = [
        "Fever", "Cough", "Vomiting", "Diarrhea",
        "Lameness", "Skin_Lesions", "Nasal_Discharge",
        "Eye_Discharge"
    ]
    animals = ["Dog", "Cow", "Goat"]
    return jsonify({
        "symptoms": symptoms,
        "animals": animals
    })

# ===============================
# SYMPTOM-BASED PREDICTION
# ===============================
@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    try:
        data = request.json
        input_df = pd.DataFrame([data])
        input_df = pd.get_dummies(input_df)
        input_df = input_df.reindex(columns=columns, fill_value=0)

        prediction = symptom_model.predict(input_df)

        return jsonify({
            "prediction": str(prediction[0])
        })

    except Exception as e:
        return jsonify({"error": str(e)})

# ===============================
# IMAGE-BASED PREDICTION (ASLI AI 🚀)
# ===============================
@app.route("/predict-image", methods=["POST"])
def predict_image():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        if file.filename == '':
            return jsonify({'error': 'Image ka naam khali hai'}), 400

        # 1. Image ko read karna aur RGB mein convert karna
        img = Image.open(io.BytesIO(file.read())).convert('RGB')
        
        # 2. Resize karna (Model ko 224x224 chahiye)
        img = img.resize((224, 224))
        
        # 3. Model ke layak array banana
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0) # Batch size add karna
        img_array = preprocess_input(img_array) # Scale karna (-1 to 1)

        # 4. Asli Prediction Karwana!
        predictions = image_model.predict(img_array)
        score = tf.nn.softmax(predictions[0]) # Probabilities nikalna
        
        # Sabse high probability wali bimari dhoondhna
        predicted_class = image_class_names[np.argmax(score)]
        confidence = 100 * np.max(score)

        return jsonify({
            "image_prediction": predicted_class,
            "confidence": f"{confidence:.2f}%"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===============================
# RUN SERVER
# ===============================
if __name__ == "__main__":
    app.run(debug=True, port=5000)