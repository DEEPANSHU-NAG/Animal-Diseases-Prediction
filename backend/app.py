from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
from PIL import Image
import random

# ===============================
# MEDICAL DATABASE (Shifted to Backend)
# ===============================
disease_database = {
    "Parvovirus": {
        "severity": "Critical",
        "recoveryTime": "1 to 2 Weeks",
        "description": "A highly contagious and life-threatening viral disease that aggressively attacks the intestinal tract and white blood cells of dogs, especially unvaccinated puppies.",
        "causes": [
            "Direct contact with an infected dog.",
            "Indirect contact with contaminated feces, environments, or people."
        ],
        "symptoms": [
            { "name": "Severe Vomiting", "detail": "Frequent, forceful vomiting preventing the animal from keeping food/water down." },
            { "name": "Bloody Diarrhea", "detail": "Foul-smelling, liquid stool containing blood, causing extreme dehydration." },
            { "name": "Extreme Lethargy", "detail": "Complete loss of energy; the animal may refuse to stand or walk." }
        ],
        "immediate_action": "Do not wait. Rush the animal to an emergency veterinary clinic immediately. Survival depends entirely on early intervention.",
        "treatment": [
            "Aggressive Intravenous (IV) Fluid Therapy.",
            "Anti-nausea and anti-diarrhea medications.",
            "Antibiotics to prevent secondary bacterial infections."
        ],
        "precautions": [
            { "name": "Vaccination", "detail": "Ensure puppies receive the full series of Parvo vaccines starting at 6-8 weeks." },
            { "name": "Strict Disinfection", "detail": "Clean contaminated areas with a 1:30 bleach-to-water solution." }
        ]
    },
    "Foot and Mouth Disease": {
        "severity": "High Priority",
        "recoveryTime": "2 to 3 Weeks",
        "description": "A severe, highly contagious viral disease of livestock (cattle, swine, sheep, goats) that has massive economic impacts on farming.",
        "causes": [
            "Airborne spread of the Aphthovirus during close contact.",
            "Contaminated vehicles, equipment, clothing, and feed."
        ],
        "symptoms": [
            { "name": "High Fever", "detail": "Sudden onset of fever lasting for 2 to 3 days." },
            { "name": "Painful Blisters", "detail": "Blisters in the mouth, on the snout, and hooves that rupture and cause ulcers." },
            { "name": "Lameness & Drooling", "detail": "Reluctance to move due to foot pain, accompanied by heavy salivation." }
        ],
        "immediate_action": "Quarantine the affected animals instantly. Do not move any livestock on or off the farm. Notify local agricultural authorities immediately.",
        "treatment": [
            "There is no specific cure; treatment is supportive.",
            "Painkillers and soft feed to encourage eating.",
            "Antibiotics to treat secondary skin infections on ruptured blisters."
        ],
        "precautions": [
            { "name": "Biosecurity", "detail": "Strictly restrict farm access. Disinfect all footwear and equipment." },
            { "name": "Ring Vaccination", "detail": "Vaccinate healthy animals in surrounding areas as directed by authorities." }
        ]
    },
    "Gastroenteritis": {
        "severity": "Moderate",
        "recoveryTime": "3 to 7 Days",
        "description": "An inflammation of the stomach and intestines resulting in sudden onset of vomiting and diarrhea. It can be caused by various factors including diet or infections.",
        "causes": [
            "Eating spoiled food, garbage, or toxic plants (Dietary indiscretion).",
            "Bacterial infections (Salmonella, E. coli) or intestinal parasites."
        ],
        "symptoms": [
            { "name": "Vomiting & Diarrhea", "detail": "Frequent loose stools and throwing up, which can lead to rapid dehydration." },
            { "name": "Abdominal Pain", "detail": "Stomach area may be tender to the touch; animal may hunch its back." },
            { "name": "Loss of Appetite", "detail": "Refusing normal meals or treats." }
        ],
        "immediate_action": "Withhold food for 12-24 hours to let the stomach rest, but provide small, frequent amounts of fresh water to prevent dehydration.",
        "treatment": [
            "Bland diet (e.g., boiled chicken and white rice) for a few days.",
            "Probiotics to restore healthy gut bacteria.",
            "Subcutaneous or IV fluids if severely dehydrated."
        ],
        "precautions": [
            { "name": "Dietary Consistency", "detail": "Avoid sudden changes in diet and do not feed table scraps." },
            { "name": "Parasite Control", "detail": "Maintain a regular deworming schedule." }
        ]
    },
    "Upper Respiratory Infection": {
        "severity": "Low to Moderate",
        "recoveryTime": "7 to 10 Days",
        "description": "Common in both cats and dogs, these infections are similar to a human cold and are highly contagious in crowded environments like shelters.",
        "causes": [
            "Viruses (Feline Herpesvirus, Calicivirus) or Bacteria (Bordetella bronchiseptica)."
        ],
        "symptoms": [
            { "name": "Sneezing & Coughing", "detail": "Frequent bouts of sneezing and a dry or wet hacking cough." },
            { "name": "Discharge", "detail": "Clear, yellow, or greenish mucous from the nose or eyes." },
            { "name": "Fever & Lethargy", "detail": "Mild fever and decreased energy levels." }
        ],
        "immediate_action": "Keep the animal warm, dry, and away from healthy pets. Use a humidifier or take them into a steamy bathroom to help clear congestion.",
        "treatment": [
            "Supportive care, rest, and hydration.",
            "Strong-smelling, warmed-up wet food to encourage eating.",
            "Antibiotics (only if a secondary bacterial infection is suspected by a vet)."
        ],
        "precautions": [
            { "name": "Vaccination", "detail": "Keep up with core vaccines (like FVRCP for cats or DHPP/Bordetella for dogs)." },
            { "name": "Avoid Overcrowding", "detail": "Limit exposure to places with high densities of unknown animals." }
        ]
    },
    "Unknown": {
        "severity": "Pending",
        "recoveryTime": "Varies",
        "description": "The AI could not confidently identify the disease with the provided data, or the condition is not currently in our offline medical database.",
        "causes": ["Insufficient symptoms provided or rare condition."],
        "symptoms": [{ "name": "Varying Symptoms", "detail": "Symptoms may vary depending on the actual underlying condition." }],
        "immediate_action": "Observe the animal closely. Take notes on their behavior, eating habits, and any visible abnormalities.",
        "treatment": ["Wait for professional diagnosis before administering any medication."],
        "precautions": [
            { "name": "Consult a Veterinarian", "detail": "Schedule a comprehensive blood test and physical examination." },
            { "name": "Isolate to be safe", "detail": "Keep away from other pets until cleared by a vet." }
        ]
    }
}

# HELPER FUNCTION: Get Disease Info
def get_disease_info(predicted_name):
    clean_name = str(predicted_name).strip()
    # Check if disease exists in DB
    for key in disease_database.keys():
        if key.lower() == clean_name.lower():
            data = disease_database[key].copy()
            data["disease"] = key
            return data
    
    # Fallback if unknown
    fallback = disease_database["Unknown"].copy()
    fallback["disease"] = clean_name if clean_name else "Unknown"
    return fallback


# ===============================
# CREATE APP
# ===============================
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ===============================
# LOAD MODEL & COLUMNS
# ===============================
try:
    model = pickle.load(open("animal_disease_model.pkl", "rb"))
    columns = pickle.load(open("columns.pkl", "rb"))
except:
    print("Warning: Model files not found. Ensure 'animal_disease_model.pkl' and 'columns.pkl' exist.")
    model = None
    columns = None

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
        data = request.json
        print("\n========== INCOMING DATA ==========")
        print(data)

        input_df = pd.DataFrame([data])
        input_df = input_df.reindex(columns=columns, fill_value=0)

        print("\n========== MODEL INPUT ==========")
        print(input_df)

        prediction = model.predict(input_df)
        predicted_disease_str = str(prediction[0])
        print("\n========== PREDICTION ==========")
        print(predicted_disease_str)

        # GET RICH DETAILS FROM BACKEND DB
        report_data = get_disease_info(predicted_disease_str)

        return jsonify({
            "success": True,
            "report": report_data
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
        if "file" not in request.files:
            return jsonify({
                "success": False,
                "error": "No file uploaded"
            })

        file = request.files["file"]
        img = Image.open(file).convert("RGB")
        img = img.resize((224, 224))
        img = np.array(img) / 255.0
        img = np.expand_dims(img, axis=0)

        # TEMPORARY RANDOM PREDICTION FOR IMAGE
        prediction = random.choice([
            "Skin Infection",
            "Upper Respiratory Infection", # Matches DB
            "Parvovirus",                  # Matches DB
            "Gastroenteritis"              # Matches DB
        ])

        # GET RICH DETAILS FROM BACKEND DB
        report_data = get_disease_info(prediction)

        return jsonify({
            "success": True,
            "report": report_data
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