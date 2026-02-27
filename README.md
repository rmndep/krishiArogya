# KrishiArogya 🌱🏥

An intelligent agricultural AI platform that helps farmers make informed decisions about crop selection and disease management.

## 🌟 Features

### 🌾 Crop Predictor
- Smart crop recommendations based on soil and weather conditions
- ML confidence scoring for reliability assessment
- Real-time input validation with helpful hints
- Support for 24+ crop varieties

### �� Crop Doctor
- AI-powered crop disease diagnosis
- Image upload support for enhanced analysis
- Expert solutions with severity assessment
- English & Hindi language support

## 🛠 Tech Stack

**Frontend:** React 19 + Vite + Axios  
**Backend:** Express.js 5.2.1 + Multer  
**ML Service:** FastAPI + Scikit-learn  
**AI:** Groq API for disease diagnosis

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Groq API key from https://console.groq.com/

### Setup & Run

**1. ML Service**
```bash
cd ml-service
pip install fastapi uvicorn numpy scikit-learn pandas
python3 main.py
```

**2. Backend**
```bash
cd backend
npm install
echo "GROK_API_KEY=your_groq_key" > .env
node server.js
```

**3. Frontend**
```bash
cd frontend/krishiarogya-ui
npm install
npm run dev
```

Open **http://localhost:5173** in browser.

## 📝 API Endpoints

**Crop Prediction:**
```
POST /predict
{
  "N": 90, "P": 42, "K": 43,
  "temperature": 21.77, "humidity": 82,
  "ph": 6.5, "rainfall": 202.94
}
```

**Crop Doctor:**
```
POST /crop-doctor
Form Data: text, image (optional)
```

## 📂 Project Structure

```
krishiArogya/
├── frontend/krishiarogya-ui/  (React app)
├── backend/                   (Express API)
├── ml-service/                (FastAPI ML server)
└── README.md
```

## 🌾 Supported Crops

Rice, Wheat, Maize, Chickpea, Kidneybeans, Mango, Banana, Grapes, Apple, Orange, Coconut, Cotton, Sugarcane, and more.

## ⚙️ Configuration

Add to `backend/.env`:
```
GROK_API_KEY=your_groq_api_key_here
```

Get API key from: https://console.groq.com/

## 📋 Input Ranges

- **Nitrogen:** 0-140 mg/kg
- **Phosphorus:** 0-145 mg/kg
- **Potassium:** 0-205 mg/kg
- **Temperature:** 8-43°C
- **Humidity:** 0-100%
- **pH:** 3.5-9.5
- **Rainfall:** 20-250 mm

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Kill process or change port |
| Crop Doctor not working | Verify GROK_API_KEY in .env |
| ML service error | Install all Python dependencies |

## ✨ Highlights

✅ Modern gradient UI with animations  
✅ Real-time input validation  
✅ AI disease diagnosis with image support  
✅ Multilingual (English/Hindi)  
✅ Confidence scoring  
✅ Mobile responsive

---

**Empowering Farmers with AI** 🚀
