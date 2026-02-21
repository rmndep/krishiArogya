# 🌾 KrishiArogya

> AI-Powered Crop Recommendation System

An intelligent crop recommendation application that predicts the best crop to plant based on soil nutrients and weather conditions using Machine Learning.

## ✨ Features

- 🤖 **AI-Powered Predictions** - Ensemble ML model (Random Forest, SVM, KNN)
- 🎨 **Modern UI** - Beautiful, responsive design with input validation
- 📱 **Mobile Friendly** - Works seamlessly on all devices
- ⚡ **Real-time Validation** - Instant feedback on input errors
- 📊 **Confidence Scoring** - See prediction confidence levels

## 🛠 Tech Stack

**Frontend**

- React 19.2.0
- Vite (build tool)
- Axios (HTTP client)
- CSS3

**Backend**

- Express.js 5.2.1
- Node.js

**ML Service**

- FastAPI
- Python 3.13
- scikit-learn
- Ensemble Learning

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- Python 3.8+

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/rmndep/krishiArogya.git
cd krishiArogya
```

2. **Install dependencies**

Frontend:

```bash
cd frontend/krishiarogya-ui
npm install
```

Backend:

```bash
cd backend
npm install
```

ML Service:

```bash
cd ml-service
pip install fastapi uvicorn numpy scikit-learn joblib
```

### Running

**Terminal 1 - ML Service (start first)**

```bash
cd ml-service
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Backend**

```bash
cd backend
node server.js
```

**Terminal 3 - Frontend**

```bash
cd frontend/krishiarogya-ui
npm run dev
```

Open your browser at `http://localhost:5173`

## 📋 Input Parameters

| Parameter      | Range   | Unit  |
| -------------- | ------- | ----- |
| Nitrogen (N)   | 0-140   | mg/kg |
| Phosphorus (P) | 0-145   | mg/kg |
| Potassium (K)  | 0-205   | mg/kg |
| Temperature    | 8-43    | °C    |
| Humidity       | 0-100   | %     |
| pH Level       | 3.5-9.5 | -     |
| Rainfall       | 20-250  | mm    |

## 🎯 Supported Crops

Rice, Wheat, Chickpea, Kidneybeans, Pigeonpeas, Mothbeans, Mungbeans, Blackgram, Lentil, Pomegranate, Banana, Mango, Grapes, Watermelon, Muskmelon, Apple, Orange, Papaya, Coconut, Cotton, Sugarcane, Tobacco, Jute, Maize

## 🔌 API

**Endpoint:** `POST http://localhost:5000/predict`

**Request:**

```json
{
  "N": 90,
  "P": 42,
  "K": 43,
  "temperature": 21.77,
  "humidity": 82,
  "ph": 6.5,
  "rainfall": 202.94
}
```

**Response:**

```json
{
  "crop": "rice",
  "confidence": 0.95
}
```

## 📚 Project Structure

```
krishiArogya/
├── frontend/
│   └── krishiarogya-ui/
│       └── src/
│           ├── App.jsx
│           ├── App.css
│           └── index.css
├── backend/
│   └── server.js
├── ml-service/
│   ├── main.py
│   ├── train.py
│   ├── model.pkl
│   └── scaler.pkl
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Crop recommendation dataset from Kaggle
- Built with ❤️ for farmers worldwide

---

**Empowering farmers with AI technology for sustainable farming** 🚀
