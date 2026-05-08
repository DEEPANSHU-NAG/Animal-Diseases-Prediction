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
    return jsonify({
        "message": "✅ Animal Disease Prediction API Running"
    })

# ===============================
# METADATA ROUTE
# ===============================
@app.route("/metadata", methods=["GET"])
def metadata():

    metadata_data = {

        "animals": [
            {"label": "Cow", "value": 1},
            {"label": "Dog", "value": 2},
            {"label": "Goat", "value": 3},
            {"label": "Horse", "value": 4},
            {"label": "Pig", "value": 5},
            {"label": "Sheep", "value": 7}
        ],

        "symptoms": [
            {"label": "Fever", "value": 1},
            {"label": "Cough", "value": 6},
            {"label": "Breathing Problem", "value": 5},
            {"label": "Vomiting", "value": 8},
            {"label": "Diarrhea", "value": 15},
            {"label": "Skin Infection", "value": 12},
            {"label": "Weakness", "value": 14},
            {"label": "Loss of Appetite", "value": 7},
            {"label": "Eye Infection", "value": 13}
        ],

        "diseases": [
            "Bovine Tuberculosis",
            "Bovine Respiratory Disease",
            "Equine Influenza",
            "Canine Parvovirus",
            "Caprine Arthritis Encephalitis",
            "Canine Distemper",
            "Scrapie",
            "Swine Influenza"
        ]
    }

    return jsonify(metadata_data)

# ===============================
# PREDICTION ROUTE
# ===============================
@app.route("/predict", methods=["POST"])
def predict():

    try:

        # ===============================
        # GET JSON DATA
        # ===============================
        data = request.json

        print("\n========== INCOMING DATA ==========")
        print(data)

        # ===============================
        # CREATE INPUT DATAFRAME
        # ===============================
        input_df = pd.DataFrame([data])

        # ===============================
        # MATCH TRAINING COLUMNS
        # ===============================
        input_df = input_df.reindex(columns=columns, fill_value=0)

        print("\n========== MODEL INPUT ==========")
        print(input_df)

        # ===============================
        # MAKE PREDICTION
        # ===============================
        prediction = model.predict(input_df)

        print("\n========== PREDICTION ==========")
        print(prediction)

        # ===============================
        # RETURN RESPONSE
        # ===============================
        return jsonify({
            "success": True,
            "prediction": str(prediction[0])
        })

    except Exception as e:

        print("\n========== ERROR ==========")
        print(str(e))

        return jsonify({
            "success": False,
            "error": str(e)
        })

# ===============================
# IMAGE PREDICTION ROUTE
# ===============================
@app.route("/predict-image", methods=["POST"])
def predict_image():

    try:

        # ===============================
        # CHECK FILE
        # ===============================
        if "file" not in request.files:
            return jsonify({
                "success": False,
                "error": "No file uploaded"
            })

        file = request.files["file"]

        # ===============================
        # IMAGE PREPROCESSING
        # ===============================
        img = Image.open(file).convert("RGB")
        img = img.resize((224, 224))

        img = np.array(img) / 255.0
        img = np.expand_dims(img, axis=0)

        # ===============================
        # TEMPORARY RANDOM PREDICTION
        # ===============================
        prediction = random.choice([
            "Skin Infection",
            "Fever",
            "Healthy",
            "Injury"
        ])

        # ===============================
        # RETURN RESPONSE
        # ===============================
        return jsonify({
            "success": True,
            "image_prediction": prediction
        })

    except Exception as e:

        print("\n========== IMAGE ERROR ==========")
        print(str(e))

        return jsonify({
            "success": False,
            "error": str(e)
        })

# ===============================
# RUN APP
# ===============================
if __name__ == "__main__":
    app.run(debug=True)