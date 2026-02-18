import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import joblib

df = pd.read_csv("dataset/Crop_recommendation.csv")

X = df.drop("label", axis=1)
y = df["label"]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)

rf = RandomForestClassifier(n_estimators=200)
svm = SVC(probability=True)
knn = KNeighborsClassifier(n_neighbors=7)

rf.fit(X_train, y_train)
svm.fit(X_train, y_train)
knn.fit(X_train, y_train)

meta_X_train = np.hstack([
    rf.predict_proba(X_train),
    svm.predict_proba(X_train),
    knn.predict_proba(X_train)
])

meta = LogisticRegression(max_iter=1000)
meta.fit(meta_X_train, y_train)

meta_X_test = np.hstack([
    rf.predict_proba(X_test),
    svm.predict_proba(X_test),
    knn.predict_proba(X_test)
])

pred = meta.predict(meta_X_test)
print("Accuracy:", accuracy_score(y_test, pred))

joblib.dump({"rf": rf, "svm": svm, "knn": knn, "meta": meta}, "model.pkl")
joblib.dump(scaler, "scaler.pkl")
