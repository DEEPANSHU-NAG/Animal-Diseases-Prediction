import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const App = () =>{

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
  const [imageResult, setImageResult] = useState("");

  // 🌟 NAYA CODE: Tab ka title change karne ke liye
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

  // Handle form input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit symptom prediction
  const handleSubmit = async () => {

    if (!formData.Animal_Type || !formData.Symptom_1) {
      alert("Please select required fields!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/predict", formData);
      setResult(res.data.prediction);
      
      // 🌟 EXTRA TIP: Agar aap chahte hain ki prediction aane ke baad title update ho jaye
      document.title = `Prediction: ${res.data.prediction} 🐾`;

    } catch (error) {
      console.error(error);
      alert("Error connecting to backend");
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Upload image
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
      
      // 🌟 EXTRA TIP: Image prediction ke baad bhi title update kar sakte hain
      document.title = `Image Result: ${res.data.image_prediction} 📸`;

    } catch (error) {
      console.error(error);
      alert("Image upload failed");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>🐾 Animal Disease Predictor</h2>

        {/* Animal Dropdown */}
        <select name="Animal_Type" onChange={handleChange}>
          <option value="">Select Animal</option>
          {animals.map((a, i) => (
            <option key={i} value={a}>{a}</option>
          ))}
        </select>

        {/* Symptoms */}
        <select name="Symptom_1" onChange={handleChange}>
          <option value="">Select Symptom 1</option>
          {symptoms.map((s, i) => (
            <option key={i} value={s}>{s}</option>
          ))}
        </select>

        <select name="Symptom_2" onChange={handleChange}>
          <option value="">Select Symptom 2</option>
          {symptoms.map((s, i) => (
            <option key={i} value={s}>{s}</option>
          ))}
        </select>

        {/* Yes/No */}
        <select name="Appetite_Loss" onChange={handleChange}>
          <option value="">Appetite Loss?</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>

        {/* Inputs */}
        <input name="Age" placeholder="Age (days)" onChange={handleChange} />
        <input name="Weight" placeholder="Weight" onChange={handleChange} />

        {/* Predict Button */}
        <button onClick={handleSubmit}>Predict Disease</button>

        {result && (
          <div className="result">
            <h3>Prediction: {result}</h3>
          </div>
        )}

        <hr />

        {/* IMAGE SECTION */}
        <h3>📸 Upload Animal Image</h3>

        <input type="file" onChange={handleImageChange} />

        <button onClick={handleImageUpload}>
          Predict from Image
        </button>

        {imageResult && (
          <div className="result">
            <h3>Image Prediction: {imageResult}</h3>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;