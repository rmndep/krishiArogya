from fastapi import FastAPI
import numpy as np
import joblib

app = FastAPI()

models = joblib.load("model.pkl")
scaler = joblib.load("scaler.pkl")

@app.post("/predict")
def predict(data: dict):
    x = np.array([[ 
        data["N"], data["P"], data["K"],
        data["temperature"], data["humidity"],
        data["ph"], data["rainfall"]
    ]])
    x = scaler.transform(x)

    rf_p = models["rf"].predict_proba(x)
    svm_p = models["svm"].predict_proba(x)
    knn_p = models["knn"].predict_proba(x)

    meta_input = np.hstack([rf_p, svm_p, knn_p])
    crop = models["meta"].predict(meta_input)[0]
    conf = max(models["meta"].predict_proba(meta_input)[0])

    return {
        "crop": crop,
        "confidence": round(float(conf), 3)
    }
