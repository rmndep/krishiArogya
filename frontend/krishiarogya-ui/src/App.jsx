import { useState } from 'react';
import axios from 'axios';
import './App.css';

export default function App() {
  const [activePage, setActivePage] = useState('predictor'); // 'predictor' or 'doctor'
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Crop Doctor states
  const [doctorInput, setDoctorInput] = useState('');
  const [doctorImage, setDoctorImage] = useState(null);
  const [doctorImagePreview, setDoctorImagePreview] = useState(null);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [doctorResult, setDoctorResult] = useState(null);
  const [doctorError, setDoctorError] = useState(null);

  // Define field constraints with validation rules
  const fields = [
    {
      key: 'N',
      label: 'Nitrogen (N)',
      unit: 'mg/kg',
      min: 0,
      max: 140,
      required: true,
    },
    {
      key: 'P',
      label: 'Phosphorus (P)',
      unit: 'mg/kg',
      min: 0,
      max: 145,
      required: true,
    },
    {
      key: 'K',
      label: 'Potassium (K)',
      unit: 'mg/kg',
      min: 0,
      max: 205,
      required: true,
    },
    {
      key: 'temperature',
      label: 'Temperature',
      unit: '°C',
      min: 8,
      max: 43,
      required: true,
    },
    {
      key: 'humidity',
      label: 'Humidity',
      unit: '%',
      min: 0,
      max: 100,
      required: true,
    },
    {
      key: 'ph',
      label: 'pH Level',
      unit: '',
      min: 3.5,
      max: 9.5,
      required: true,
    },
    {
      key: 'rainfall',
      label: 'Rainfall',
      unit: 'mm',
      min: 20,
      max: 250,
      required: true,
    },
  ];

  // Validation function for individual field
  const validateField = (key, value) => {
    const field = fields.find((f) => f.key === key);
    if (!field) return null;

    // Check if field is empty
    if (
      field.required &&
      (value === '' || value === null || value === undefined)
    ) {
      return `${field.label} is required`;
    }

    const numValue = parseFloat(value);

    // Check if value is a valid number
    if (isNaN(numValue)) {
      return `${field.label} must be a valid number`;
    }

    // Check minimum value
    if (numValue < field.min) {
      return `${field.label} must be at least ${field.min}`;
    }

    // Check maximum value
    if (numValue > field.max) {
      return `${field.label} cannot exceed ${field.max}`;
    }

    return null;
  };

  // Validate all fields
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    fields.forEach(({ key }) => {
      const error = validateField(key, form[key]);
      if (error) {
        errors[key] = error;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const predict = async () => {
    // Validate form before making prediction
    if (!validateForm()) {
      setError('Please fix the validation errors above.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:5000/predict', form);
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Failed to get prediction. Please check your inputs.',
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setForm({ ...form, [key]: value });

    // Validate field on change and clear error if valid
    const error = validateField(key, value);
    if (error) {
      setValidationErrors((prev) => ({ ...prev, [key]: error }));
    } else {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleReset = () => {
    setForm({});
    setResult(null);
    setError(null);
    setValidationErrors({});
  };

  // Crop Doctor functions
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDoctorImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDoctorImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDoctorSubmit = async () => {
    if (!doctorInput.trim() && !doctorImage) {
      setDoctorError('Please describe the problem or upload an image.');
      return;
    }

    setDoctorLoading(true);
    setDoctorError(null);

    try {
      const formData = new FormData();
      formData.append('text', doctorInput);
      if (doctorImage) {
        formData.append('image', doctorImage);
      }

      const res = await axios.post(
        'http://localhost:5000/crop-doctor',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      setDoctorResult(res.data);
    } catch (err) {
      setDoctorError(
        err.response?.data?.error || 'Failed to diagnose. Please try again.',
      );
      console.error(err);
    } finally {
      setDoctorLoading(false);
    }
  };

  const handleDoctorReset = () => {
    setDoctorInput('');
    setDoctorImage(null);
    setDoctorImagePreview(null);
    setDoctorResult(null);
    setDoctorError(null);
  };

  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo-section">
            <span className="logo-icon">🌾</span>
            <h1 className="brand-name">KrishiArogya</h1>
          </div>
          <p className="tagline">Smart Crop Prediction for Modern Farming</p>

          {/* Navigation Tabs */}
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activePage === 'predictor' ? 'active' : ''}`}
              onClick={() => {
                setActivePage('predictor');
                setResult(null);
                setError(null);
              }}
            >
              🌱 Crop Predictor
            </button>
            <button
              className={`nav-tab ${activePage === 'doctor' ? 'active' : ''}`}
              onClick={() => {
                setActivePage('doctor');
                setDoctorResult(null);
                setDoctorError(null);
              }}
            >
              🏥 Crop Doctor
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h2 className="hero-title">
            {activePage === 'predictor'
              ? '🌱 AI-Powered Crop Prediction'
              : '🏥 Crop Doctor - Diagnosis & Treatment'}
          </h2>
          <p className="hero-description">
            {activePage === 'predictor'
              ? 'Optimize your farming decisions with advanced machine learning. Input your soil nutrients and weather conditions to get the perfect crop recommendation.'
              : 'Describe your crop problem or upload an image, and get an AI diagnosis with treatment recommendations in your language.'}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        {activePage === 'predictor' ? (
          // CROP PREDICTOR PAGE
          <div className="container">
            <div className="predictor-card">
              <div className="card-header">
                <h2>Crop Recommendation Engine</h2>
                <p>Fill in the soil and weather parameters below</p>
              </div>

              {/* Input Form */}
              <div className="form-section">
                {Object.keys(validationErrors).length > 0 && (
                  <div className="validation-summary">
                    <div className="summary-header">
                      <span className="summary-icon">⚠️</span>
                      <span className="summary-title">
                        {Object.keys(validationErrors).length} validation
                        error(s)
                      </span>
                    </div>
                    <ul className="summary-list">
                      {Object.entries(validationErrors).map(
                        ([key, message]) => (
                          <li key={key}>
                            <strong>
                              {fields.find((f) => f.key === key)?.label}:
                            </strong>{' '}
                            {message}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

                <div className="input-grid">
                  {fields.map(({ key, label, unit, min, max }) => (
                    <div key={key} className="input-group">
                      <label htmlFor={key} className="input-label">
                        {label}
                        {unit && <span className="unit-badge">{unit}</span>}
                        <span className="range-hint">
                          ({min}-{max})
                        </span>
                      </label>
                      <input
                        id={key}
                        type="number"
                        placeholder={`${min} - ${max}`}
                        value={form[key] || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className={`form-input ${validationErrors[key] ? 'input-error' : ''}`}
                        min={min}
                        max={max}
                      />
                      {validationErrors[key] && (
                        <span className="error-message">
                          <span className="error-icon">✕</span>
                          {validationErrors[key]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Buttons */}
                <div className="button-group">
                  <button
                    onClick={predict}
                    disabled={
                      loading || Object.keys(validationErrors).length > 0
                    }
                    className="btn btn-primary"
                    title={
                      Object.keys(validationErrors).length > 0
                        ? 'Please fix validation errors'
                        : ''
                    }
                  >
                    {loading ? 'Predicting...' : 'Get Recommendation'}
                  </button>
                  <button onClick={handleReset} className="btn btn-secondary">
                    Reset Form
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert alert-error">
                  <span className="alert-icon">⚠️</span>
                  <p>{error}</p>
                </div>
              )}

              {/* Result Section */}
              {result && (
                <div className="result-section">
                  <div className="result-card">
                    <div className="result-header">
                      <h3>Recommended Crop</h3>
                    </div>
                    <div className="result-content">
                      <div className="crop-name">{result.crop}</div>
                      <div className="confidence-section">
                        <span className="confidence-label">Confidence:</span>
                        <div className="confidence-bar">
                          <div
                            className="confidence-fill"
                            style={{
                              width: `${Math.min(parseFloat(result.confidence) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="confidence-value">
                          {result.confidence}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Section */}
              <div className="info-section">
                <div className="info-box">
                  <span className="info-icon">💡</span>
                  <div>
                    <h4>How it works</h4>
                    <p>
                      Our AI model analyzes soil nutrients (N, P, K),
                      temperature, humidity, pH level, and rainfall to recommend
                      the most suitable crop for your field.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // CROP DOCTOR PAGE
          <div className="container">
            <div className="predictor-card">
              <div className="card-header">
                <h2>🏥 Crop Doctor - AI Diagnosis</h2>
                <p>Describe your crop problem or upload an image</p>
              </div>

              <div className="form-section">
                {/* Doctor Input */}
                <div className="doctor-input-section">
                  <label className="doctor-label">
                    📝 Describe Your Problem (English/Hindi)
                  </label>
                  <textarea
                    className="doctor-textarea"
                    placeholder="E.g., 'My rice crop has yellow spots on leaves' or 'मेरी गेहूं की फसल पर भूरे धब्बे हैं'"
                    value={doctorInput}
                    onChange={(e) => setDoctorInput(e.target.value)}
                    rows="4"
                  />
                </div>

                {/* Image Upload */}
                <div className="doctor-image-section">
                  <label className="doctor-label">
                    📸 Upload Crop Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="doctor-file-input"
                  />
                  {doctorImagePreview && (
                    <div className="image-preview">
                      <img
                        src={doctorImagePreview}
                        alt="Crop"
                        className="preview-image"
                      />
                      <button
                        className="remove-image-btn"
                        onClick={() => {
                          setDoctorImage(null);
                          setDoctorImagePreview(null);
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Doctor Buttons */}
                <div className="button-group">
                  <button
                    onClick={handleDoctorSubmit}
                    disabled={
                      doctorLoading || (!doctorInput.trim() && !doctorImage)
                    }
                    className="btn btn-primary"
                  >
                    {doctorLoading ? 'Diagnosing...' : '🔍 Get Diagnosis'}
                  </button>
                  <button
                    onClick={handleDoctorReset}
                    className="btn btn-secondary"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Doctor Error */}
              {doctorError && (
                <div className="alert alert-error">
                  <span className="alert-icon">⚠️</span>
                  <p>{doctorError}</p>
                </div>
              )}

              {/* Doctor Result */}
              {doctorResult && (
                <div className="result-section">
                  <div className="result-card">
                    <div className="result-header">
                      <h3>🏥 Diagnosis Report</h3>
                    </div>
                    <div className="doctor-result-content">
                      <div className="result-item">
                        <h4>🌾 Problem Identified</h4>
                        <p>{doctorResult.diagnosis?.problem}</p>
                      </div>
                      <div className="result-item">
                        <h4>🔍 Possible Cause</h4>
                        <p>{doctorResult.diagnosis?.cause}</p>
                      </div>
                      <div className="result-item">
                        <h4>💊 Recommended Solution</h4>
                        <div className="solution-text">
                          {doctorResult.diagnosis?.solution}
                        </div>
                      </div>
                      <div className="result-item">
                        <h4>🛡️ Preventive Measures</h4>
                        <div className="prevention-text">
                          {doctorResult.diagnosis?.prevention}
                        </div>
                      </div>
                      <div className="result-item severity">
                        <h4>⚠️ Severity Level</h4>
                        <span
                          className={`severity-badge severity-${doctorResult.diagnosis?.severity.toLowerCase()}`}
                        >
                          {doctorResult.diagnosis?.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Section */}
              <div className="info-section">
                <div className="info-box">
                  <span className="info-icon">ℹ️</span>
                  <div>
                    <h4>How Crop Doctor Works</h4>
                    <p>
                      Describe your crop problem or upload a photo, and our AI
                      will diagnose the issue. Responses are provided in English
                      or Hindi based on your input language. For severe issues,
                      consult a local agricultural expert.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>
            &copy; 2026 KrishiArogya. Empowering farmers with AI technology.
          </p>
          <p className="footer-tagline">
            Sustainable farming for a better tomorrow
          </p>
        </div>
      </footer>
    </div>
  );
}
