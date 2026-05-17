import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("manual");
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    Animal_Type: "", Symptom_1: "", Symptom_2: "", Appetite_Loss: "", Age: "", Weight: ""
  });

  const [symptoms, setSymptoms] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); 
  const [report, setReport] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/metadata")
      .then((res) => {
        setSymptoms(res.data.symptoms || []);
        setAnimals(res.data.animals || []);
      })
      .catch((err) => console.log("Metadata Error:", err));
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setReport(null); 
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setReport(null); 
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); 
      setReport(null); 
    }
  };

  const handleSubmitText = async () => {
    if (!formData.Animal_Type || !formData.Symptom_1) {
      alert("Please select required fields!");
      return;
    }
    setIsLoading(true);
    setReport(null);
    try {
      const res = await axios.post("http://localhost:5000/predict", formData);
      if (res.data.success) {
        // Backend directly sends the full report object now
        setReport(res.data.report);
      } else {
        alert(`Prediction failed: ${res.data.error}`);
      }
    } catch (error) {
      alert(`Error connecting to backend: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!image) {
      alert("Please select an image!");
      return;
    }
    setIsLoading(true);
    setReport(null);
    const imgData = new FormData();
    imgData.append("file", image);

    try {
      const res = await axios.post("http://localhost:5000/predict-image", imgData);
      if (res.data.success) {
        // Backend directly sends the full report object now
        setReport(res.data.report);
      } else {
        alert(`Image upload failed: ${res.data.error}`);
      }
    } catch (error) {
      alert(`Error connecting to backend: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🐾 VetAI Predictor</h1>
        <p>Advanced Veterinary Diagnostic & Care System</p>
      </header>

      <div className="main-content">
        {/* LEFT PANEL */}
        <div className="input-panel card">
          <div className="tabs">
            <button className={activeTab === "manual" ? "tab active" : "tab"} onClick={() => handleTabChange("manual")}>
              📝 Manual Entry
            </button>
            <button className={activeTab === "image" ? "tab active" : "tab"} onClick={() => handleTabChange("image")}>
              📸 Image Scan
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "manual" ? (
              <div className="form-grid">
                <div className="input-group">
                  <label>Animal Type</label>
                  <select name="Animal_Type" value={formData.Animal_Type} onChange={handleChange}>
                    <option value="">Select Animal</option>
                    {animals.map((a, i) => <option key={i} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Age (Years)</label>
                  <input type="number" name="Age" value={formData.Age} placeholder="e.g. 4" onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Primary Symptom</label>
                  <select name="Symptom_1" value={formData.Symptom_1} onChange={handleChange}>
                    <option value="">Select Symptom</option>
                    {symptoms.map((s, i) => <option key={i} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Secondary Symptom</label>
                  <select name="Symptom_2" value={formData.Symptom_2} onChange={handleChange}>
                    <option value="">Select Symptom</option>
                    {symptoms.map((s, i) => <option key={i} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Appetite Loss?</label>
                  <select name="Appetite_Loss" value={formData.Appetite_Loss} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Weight (Kg)</label>
                  <input type="number" name="Weight" value={formData.Weight} placeholder="e.g. 25" onChange={handleChange} />
                </div>
                <button className="primary-btn" onClick={handleSubmitText} disabled={isLoading}>
                  {isLoading ? "Running AI Engine..." : "Generate Diagnosis"}
                </button>
              </div>
            ) : (
              <div className="image-upload-section">
                <div className="upload-box">
                  {imagePreview ? (
                    <div className="preview-container">
                      <img src={imagePreview} alt="Selected Animal" className="image-preview" />
                    </div>
                  ) : (
                    <p style={{ color: "#7f8c8d", margin: "10px 0" }}>Click or Drag image here</p>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginTop: "15px" }} />
                </div>
                <button className="primary-btn" onClick={handleImageUpload} disabled={isLoading || !image}>
                  {isLoading ? "Scanning..." : "Scan Image with AI"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: FULL MEDICAL REPORT */}
        <div className="result-panel">
          {!report && !isLoading && (
            <div className="empty-state">
              <h3>System Ready</h3>
              <p>Enter clinical signs or upload an X-ray/photo to generate a comprehensive medical report.</p>
            </div>
          )}

          {isLoading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cross-referencing database & running ML model...</p>
            </div>
          )}

          {report && !isLoading && (
            <div className="report-card card fade-in" style={{ padding: "0" }}>
              
              {/* Report Header */}
              <div style={{ background: "#2c3e50", color: "white", padding: "20px", borderRadius: "12px 12px 0 0", position: "relative" }}>
                <h2 style={{ margin: "0 0 5px 0", fontSize: "1.8rem" }}>{report.disease}</h2>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <span style={{ background: report.severity === "Critical" ? "#e74c3c" : "#f39c12", padding: "5px 10px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold" }}>
                    Severity: {report.severity}
                  </span>
                  <span style={{ background: "#34495e", padding: "5px 10px", borderRadius: "4px", fontSize: "0.8rem" }}>
                    Est. Recovery: {report.recoveryTime}
                  </span>
                </div>
              </div>

              <div style={{ padding: "25px", display: "flex", flexDirection: "column", gap: "25px" }}>
                
                {/* Description */}
                <div>
                  <h4 style={{ margin: "0 0 8px 0", color: "#34495e" }}>Clinical Overview</h4>
                  <p style={{ margin: "0", color: "#555", lineHeight: "1.6" }}>{report.description}</p>
                </div>

                {/* Causes & Transmission */}
                <div style={{ background: "#f9ebf9", borderLeft: "4px solid #9b59b6", padding: "15px", borderRadius: "4px" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#8e44ad" }}>🧬 Causes & Transmission</h4>
                  <ul style={{ margin: "0", paddingLeft: "20px", color: "#555" }}>
                    {report.causes.map((c, i) => <li key={i} style={{ marginBottom: "5px" }}>{c}</li>)}
                  </ul>
                </div>

                {/* Symptoms */}
                <div>
                  <h4 style={{ margin: "0 0 10px 0", color: "#d35400", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>⚠️ Key Symptoms</h4>
                  <div style={{ display: "grid", gap: "10px" }}>
                    {report.symptoms.map((sym, idx) => (
                      <div key={idx} style={{ background: "#fff5f0", padding: "10px 15px", borderLeft: "3px solid #e67e22", borderRadius: "4px" }}>
                        <strong style={{ color: "#d35400", display: "block" }}>{sym.name}</strong>
                        <span style={{ fontSize: "0.9rem", color: "#666" }}>{sym.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Immediate Action (Emergency) */}
                <div style={{ background: "#fceceb", border: "1px solid #fadbd8", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
                  <h4 style={{ margin: "0 0 5px 0", color: "#c0392b" }}>🚨 Immediate Action Required</h4>
                  <p style={{ margin: "0", color: "#e74c3c", fontWeight: "bold", fontSize: "0.95rem" }}>{report.immediate_action}</p>
                </div>

                {/* Treatment Protocol */}
                <div>
                  <h4 style={{ margin: "0 0 10px 0", color: "#2980b9", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>💊 Medical Treatment Protocol</h4>
                  <ul style={{ margin: "0", paddingLeft: "20px", color: "#555", listStyleType: "square" }}>
                    {report.treatment.map((t, i) => <li key={i} style={{ marginBottom: "8px" }}>{t}</li>)}
                  </ul>
                </div>

                {/* Precautions */}
                <div>
                  <h4 style={{ margin: "0 0 10px 0", color: "#27ae60", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>🛡️ Prevention & Precautions</h4>
                  <div style={{ display: "grid", gap: "10px" }}>
                    {report.precautions.map((pre, idx) => (
                      <div key={idx} style={{ background: "#eafaf1", padding: "10px 15px", borderLeft: "3px solid #2ecc71", borderRadius: "4px" }}>
                        <strong style={{ color: "#229954", display: "block" }}>{pre.name}</strong>
                        <span style={{ fontSize: "0.9rem", color: "#666" }}>{pre.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <div style={{ background: "#f1f2f3", color: "#7f8c8d", padding: "12px", borderRadius: "6px", fontSize: "0.8rem", textAlign: "center" }}>
                  <strong>Disclaimer:</strong> This diagnosis is generated by an AI model for initial screening. It is not a substitute for a professional veterinary diagnosis and treatment plan.
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;