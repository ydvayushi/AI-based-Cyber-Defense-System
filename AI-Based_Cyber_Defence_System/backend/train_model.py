import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

# ==============================
# 1. Dataset path
# ==============================

dataset_path = os.path.join("uploads", "KDDTrain+.txt")

# NSL-KDD column names
columns = [
    "duration", "protocol_type", "service", "flag", "src_bytes",
    "dst_bytes", "land", "wrong_fragment", "urgent", "hot",
    "num_failed_logins", "logged_in", "num_compromised",
    "root_shell", "su_attempted", "num_root", "num_file_creations",
    "num_shells", "num_access_files", "num_outbound_cmds",
    "is_host_login", "is_guest_login", "count", "srv_count",
    "serror_rate", "srv_serror_rate", "rerror_rate",
    "srv_rerror_rate", "same_srv_rate", "diff_srv_rate",
    "srv_diff_host_rate", "dst_host_count", "dst_host_srv_count",
    "dst_host_same_srv_rate", "dst_host_diff_srv_rate",
    "dst_host_same_src_port_rate", "dst_host_srv_diff_host_rate",
    "dst_host_serror_rate", "dst_host_srv_serror_rate",
    "dst_host_rerror_rate", "dst_host_srv_rerror_rate",
    "label", "difficulty"
]

print("Loading NSL-KDD dataset...")

# ==============================
# 2. Load dataset
# ==============================

df = pd.read_csv(
    dataset_path,
    names=columns,
    header=None
)

print("Dataset loaded successfully!")
print("Total records:", len(df))

# ==============================
# 3. Convert attack labels
# ==============================

df["target"] = df["label"].apply(
    lambda x: 0 if x == "normal" else 1
)

# 0 = Normal
# 1 = Attack

# Remove original text label and difficulty
df = df.drop(columns=["label", "difficulty"])

# ==============================
# 4. Convert categorical columns
# ==============================

categorical_columns = [
    "protocol_type",
    "service",
    "flag"
]

df = pd.get_dummies(
    df,
    columns=categorical_columns
)

# ==============================
# 5. Separate features and target
# ==============================

X = df.drop(columns=["target"])
y = df["target"]

# ==============================
# 6. Train/Test split
# ==============================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Training records:", len(X_train))
print("Testing records:", len(X_test))

# ==============================
# 7. Train Random Forest
# ==============================

print("Training Random Forest model...")

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

# ==============================
# 8. Prediction
# ==============================

y_pred = model.predict(X_test)

# ==============================
# 9. Accuracy
# ==============================

accuracy = accuracy_score(y_test, y_pred)

print()
print("================================")
print("MODEL TRAINING COMPLETED")
print("================================")
print(f"Random Forest Accuracy: {accuracy * 100:.2f}%")
print()
print(classification_report(
    y_test,
    y_pred,
    target_names=["Normal", "Attack"]
))

# ==============================
# 10. Save model
# ==============================

model_data = {
    "model": model,
    "features": list(X.columns),
    "accuracy": accuracy
}

joblib.dump(
    model_data,
    "random_forest_model.pkl"
)

print("Model saved as random_forest_model.pkl")
# Save model information for Node.js backend
model_info = {
    "accuracy": round(accuracy * 100, 2),
    "model": "Random Forest",
    "status": "trained"
}

import json

with open("model_info.json", "w") as file:
    json.dump(model_info, file, indent=4)

print("Model information saved as model_info.json")