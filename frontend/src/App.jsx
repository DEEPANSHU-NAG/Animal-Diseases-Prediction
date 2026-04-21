import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [formData, setFormData] = useState({
    Animal_Type: "",
    Symptom_1: "",
    Symptom_2: "",
    Appetite_Loss: "",
    Age: "",
    Weight: ""
  });

  const [result, setResult] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [animals, setAnimals] = useState([]);

  // Image states
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // 🌟 NAYA: Image dikhane ke liye
  const [imageResult, setImageResult] = useState("");
  const [confidence, setConfidence] = useState("");   // 🌟 NAYA: AI kitna sure hai
  const [loading, setLoading] = useState(false);      // 🌟 NAYA: Loading effect

  useEffect(() => {
    document.title = "🐾 Animal Disease Predictor";
  }, []);

  // Load dropdown data
  useEffect(() => {
    axios.get("http://localhost:5000/metadata")
      .then(res => {
        setSymptoms(res.data.symptoms);
        setAnimals(res.data.animals);
      })
      .catch(err => console.log(err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.Animal_Type || !formData.Symptom_1) {
      alert("Please select required fields!");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/predict", formData);
      setResult(res.data.prediction);
      document.title = `Prediction: ${res.data.prediction} 🐾`;
    } catch (error) {
      console.error(error);
      alert("Error connecting to backend");
    }
  };

  // Handle image selection aur Preview set karna
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file)); // Image preview generate karna
    } else {
      setPreviewUrl(null);
    }
  };

  // Upload image
  const handleImageUpload = async () => {
    if (!image) {
      alert("Please select an image!");
      return;
    }

    setLoading(true); // Loading chalu
    setImageResult(""); // Purana result hatana
    setConfidence("");

    const imgData = new FormData();
    imgData.append("file", image);

    try {
      const res = await axios.post("http://localhost:5000/predict-image", imgData);
      setImageResult(res.data.image_prediction);
      setConfidence(res.data.confidence); // Confidence score set karna
      document.title = `Image Result: ${res.data.image_prediction} 📸`;
    } catch (error) {
      console.error(error);
      alert("Image upload failed");
    }
    setLoading(false); // Loading band
  };

  return (
    <div className="container">
      <div className="card">
        <h2>🐾 Animal Disease Predictor</h2>

        {/* --- Tabular Data Section --- */}
        <select name="Animal_Type" onChange={handleChange}>
          <option value="">Select Animal</option>
          {animals.map((a, i) => <option key={i} value={a}>{a}</option>)}
        </select>

        <select name="Symptom_1" onChange={handleChange}>
          <option value="">Select Symptom 1</option>
          {symptoms.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>

        <select name="Symptom_2" onChange={handleChange}>
          <option value="">Select Symptom 2</option>
          {symptoms.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>

        <select name="Appetite_Loss" onChange={handleChange}>
          <option value="">Appetite Loss?</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>

        <input name="Age" placeholder="Age (days)" onChange={handleChange} />
        <input name="Weight" placeholder="Weight" onChange={handleChange} />

        <button onClick={handleSubmit}>Predict Disease</button>

        {result && (
          <div className="result">
            <h3>Prediction: {result}</h3>
          </div>
        )}

        <hr style={{ margin: "20px 0" }} />

        {/* --- IMAGE SECTION --- */}
        <h3>📸 Upload Animal Image</h3>

        <input type="file" accept="image/*" onChange={handleImageChange} />

        {/* Image Preview Box */}
        {previewUrl && (
          <div style={{ marginTop: "10px", marginBottom: "10px" }}>
            <img 
              src={previewUrl} 
              alt="Preview" 
              style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ccc" }} 
            />
          </div>
        )}

        <button onClick={handleImageUpload} disabled={loading} style={{ background: loading ? "#9e9e9e" : "#4CAF50" }}>
          {loading ? "Predicting... ⏳" : "Predict from Image"}
        </button>

        {imageResult && (
          <div className="result" style={{ backgroundColor: "#e3f2fd" }}>
            <h3 style={{ margin: "5px 0" }}>Prediction: {imageResult}</h3>
            <p style={{ margin: "5px 0", color: "#555" }}>Confidence: <strong>{confidence}</strong></p>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;