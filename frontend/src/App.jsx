import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {

  // ===============================
  // FORM DATA
  // ===============================
  const [formData, setFormData] = useState({
    Animal_Type: "",
    Symptom_1: "",
    Symptom_2: "",
    Appetite_Loss: "",
    Age: "",
    Weight: ""
  });

  // ===============================
  // STATES
  // ===============================
  const [result, setResult] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [animals, setAnimals] = useState([]);

  // Image states
  const [image, setImage] = useState(null);
  const [imageResult, setImageResult] = useState("");

  // ===============================
  // LOAD DROPDOWN DATA
  // ===============================
  useEffect(() => {

    axios.get("http://localhost:5000/metadata")
      .then((res) => {

        console.log("Metadata:", res.data);

        setSymptoms(res.data.symptoms);
        setAnimals(res.data.animals);

      })
      .catch((err) => {
        console.log("Metadata Error:", err);
      });

  }, []);

  // ===============================
  // HANDLE INPUT CHANGE
  // ===============================
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  // ===============================
  // PREDICT DISEASE
  // ===============================
  const handleSubmit = async () => {

    if (!formData.Animal_Type || !formData.Symptom_1) {
      alert("Please select required fields!");
      return;
    }

    try {

      console.log("Sending Data:", formData);

      const res = await axios.post(
        "http://localhost:5000/predict",
        formData
      );

      console.log("Prediction Response:", res.data);

      setResult(res.data.prediction);

    } catch (error) {

      console.error(error);
      alert("Error connecting to backend");

    }
  };

  // ===============================
  // HANDLE IMAGE CHANGE
  // ===============================
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // ===============================
  // IMAGE PREDICTION
  // ===============================
  const handleImageUpload = async () => {

    if (!image) {
      alert("Please select an image!");
      return;
    }

    const imgData = new FormData();
    imgData.append("file", image);

    try {

      const res = await axios.post(
        "http://localhost:5000/predict-image",
        imgData
      );

      setImageResult(res.data.image_prediction);

    } catch (error) {

      console.error(error);
      alert("Image upload failed");

    }
  };

  // ===============================
  // UI
  // ===============================
  return (

    <div className="container">

      <div className="card">

        <h2>🐾 Animal Disease Predictor</h2>

        {/* ===============================
            ANIMAL DROPDOWN
        =============================== */}
        <select
          name="Animal_Type"
          onChange={handleChange}
        >

          <option value="">
            Select Animal
          </option>

          {animals.map((a, i) => (

            <option
              key={i}
              value={a.value}
            >
              {a.label}
            </option>

          ))}

        </select>

        {/* ===============================
            SYMPTOM 1
        =============================== */}
        <select
          name="Symptom_1"
          onChange={handleChange}
        >

          <option value="">
            Select Symptom 1
          </option>

          {symptoms.map((s, i) => (

            <option
              key={i}
              value={s.value}
            >
              {s.label}
            </option>

          ))}

        </select>

        {/* ===============================
            SYMPTOM 2
        =============================== */}
        <select
          name="Symptom_2"
          onChange={handleChange}
        >

          <option value="">
            Select Symptom 2
          </option>

          {symptoms.map((s, i) => (

            <option
              key={i}
              value={s.value}
            >
              {s.label}
            </option>

          ))}

        </select>

        {/* ===============================
            APPETITE LOSS
        =============================== */}
        <select
          name="Appetite_Loss"
          onChange={handleChange}
        >

          <option value="">
            Appetite Loss?
          </option>

          <option value="1">
            Yes
          </option>

          <option value="0">
            No
          </option>

        </select>

        {/* ===============================
            AGE
        =============================== */}
        <input
          type="number"
          name="Age"
          placeholder="Age"
          onChange={handleChange}
        />

        {/* ===============================
            WEIGHT
        =============================== */}
        <input
          type="number"
          name="Weight"
          placeholder="Weight"
          onChange={handleChange}
        />

        {/* ===============================
            PREDICT BUTTON
        =============================== */}
        <button onClick={handleSubmit}>
          Predict Disease
        </button>

        {/* ===============================
            RESULT
        =============================== */}
        {result && (

          <div className="result">
            <h3>
              Prediction: {result}
            </h3>
          </div>

        )}

        <hr />

        {/* ===============================
            IMAGE SECTION
        =============================== */}
        <h3>📸 Upload Animal Image</h3>

        <input
          type="file"
          onChange={handleImageChange}
        />

        <button onClick={handleImageUpload}>
          Predict from Image
        </button>

        {/* ===============================
            IMAGE RESULT
        =============================== */}
        {imageResult && (

          <div className="result">
            <h3>
              Image Prediction: {imageResult}
            </h3>
          </div>

        )}

      </div>

    </div>
  );
}

export default App;