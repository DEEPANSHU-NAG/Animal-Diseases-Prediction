from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
from PIL import Image
import random

# ===============================
# CREATE APP
# ===============================
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ===============================
# LOAD MODEL & COLUMNS
# ===============================
model = pickle.load(open("animal_disease_model.pkl", "rb"))
columns = pickle.load(open("columns.pkl", "rb"))

# ===============================
# HOME ROUTE
# ===============================
@app.route("/")
def home():
    return "✅ Animal Disease Prediction API Running"

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

        # Convert to DataFrame
        input_df = pd.DataFrame([data])

        # One-hot encoding
        input_df = pd.get_dummies(input_df)

        # Match training columns
        input_df = input_df.reindex(columns=columns, fill_value=0)

        # Predict
        prediction = model.predict(input_df)

        return jsonify({
            "prediction": str(prediction[0])
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        })

# ===============================
# IMAGE-BASED PREDICTION
# ===============================
@app.route("/predict-image", methods=["POST"])
def predict_image():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"})

        file = request.files["file"]

        # Open and preprocess image
        img = Image.open(file).resize((224, 224))
        img = np.array(img) / 255.0
        img = np.expand_dims(img, axis=0)

        # ⚠️ TEMPORARY FAKE PREDICTION (until you train model)
        prediction = random.choice([
            "Skin Infection",
            "Fever",
            "Healthy",
            "Injury"
        ])

        return jsonify({
            "image_prediction": prediction
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        })

# ===============================
# RUN SERVER
# ===============================
if __name__ == "__main__":
    app.run(debug=True)