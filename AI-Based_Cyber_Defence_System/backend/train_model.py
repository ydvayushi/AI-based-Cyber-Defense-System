import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report
import joblib
import json
import os

# ==============================
# 1. Dataset Path & Column Definitions
# ==============================

dataset_path = os.path.join(os.path.dirname(__file__), "uploads", "KDDTrain+.txt")

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

# Attack mappings for NSL-KDD
ATTACK_TYPES = {
    "normal": "Normal",
    # DoS
    "back": "DoS", "land": "DoS", "neptune": "DoS", "pod": "DoS", "smurf": "DoS",
    "teardrop": "DoS", "apache2": "DoS", "udpstorm": "DoS", "processtable": "DoS", "mailbomb": "DoS",
    # Probe
    "ipsweep": "Probe", "mscan": "Probe", "nmap": "Probe", "portsweep": "Probe",
    "saint": "Probe", "satan": "Probe",
    # R2L
    "ftp_write": "R2L", "guess_passwd": "R2L", "imap": "R2L", "multihop": "R2L",
    "named": "R2L", "phf": "R2L", "sendmail": "R2L", "snmpgetattack": "R2L",
    "snmpguess": "R2L", "spy": "R2L", "warezclient": "R2L", "warezmaster": "R2L",
    "xlock": "R2L", "xsnoop": "R2L",
    # U2R
    "buffer_overflow": "U2R", "httptunnel": "U2R", "loadmodule": "U2R",
    "perl": "U2R", "ps": "U2R", "rootkit": "U2R", "sqlattack": "U2R", "xterm": "U2R"
}

print("Loading NSL-KDD dataset from:", dataset_path)

if not os.path.exists(dataset_path):
    raise FileNotFoundError(f"Dataset file not found at {dataset_path}")

df = pd.read_csv(dataset_path, names=columns, header=None)
print(f"Dataset loaded successfully! Total records: {len(df)}")

# ==============================
# 2. Map Multi-class Attack Category
# ==============================
def map_attack_category(label):
    clean_label = str(label).strip().lower()
    return ATTACK_TYPES.get(clean_label, "Other")

df["attack_category"] = df["label"].apply(map_attack_category)

# Filter out unknown/rare classes if any, keep top 5 categories
valid_categories = ["Normal", "DoS", "Probe", "R2L", "U2R"]
df = df[df["attack_category"].isin(valid_categories)]

# Remove original raw label and difficulty
df = df.drop(columns=["label", "difficulty"])

print("Class distribution:")
print(df["attack_category"].value_counts())

# ==============================
# 3. Categorical One-Hot Encoding
# ==============================
categorical_columns = ["protocol_type", "service", "flag"]
df = pd.get_dummies(df, columns=categorical_columns)

# ==============================
# 4. Features and Target Split
# ==============================
X = df.drop(columns=["attack_category"])
y = df["attack_category"]

feature_columns = list(X.columns)

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print(f"Training records: {len(X_train)} | Testing records: {len(X_test)}")

# ==============================
# 5. Train Random Forest Model
# ==============================
print("Training Multi-Class Random Forest Model (Normal, DoS, Probe, R2L, U2R)...")
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)
model.fit(X_train, y_train)

# ==============================
# 6. Model Evaluation (Deliverable 4)
# ==============================
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, average="weighted", zero_division=0)
recall = recall_score(y_test, y_pred, average="weighted", zero_division=0)
f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

labels_order = [cls for cls in valid_categories if cls in model.classes_]
cm = confusion_matrix(y_test, y_pred, labels=labels_order).tolist()

report_dict = classification_report(y_test, y_pred, output_dict=True, zero_division=0)

print("\n" + "="*40)
print("MODEL EVALUATION METRICS")
print("="*40)
print(f"Accuracy  : {accuracy * 100:.2f}%")
print(f"Precision : {precision * 100:.2f}%")
print(f"Recall    : {recall * 100:.2f}%")
print(f"F1-Score  : {f1 * 100:.2f}%")
print("\nClassification Report:\n", classification_report(y_test, y_pred, zero_division=0))

# ==============================
# 7. Save Model and Metadata
# ==============================
model_path = os.path.join(os.path.dirname(__file__), "random_forest_model.pkl")
model_data = {
    "model": model,
    "features": feature_columns,
    "classes": list(model.classes_),
    "categories": valid_categories,
    "categorical_columns": categorical_columns
}
joblib.dump(model_data, model_path)
print(f"Model saved as {model_path}")

# Save detailed evaluation to model_evaluation.json
evaluation_path = os.path.join(os.path.dirname(__file__), "model_evaluation.json")
evaluation_data = {
    "accuracy": round(accuracy * 100, 2),
    "precision": round(precision * 100, 2),
    "recall": round(recall * 100, 2),
    "f1Score": round(f1 * 100, 2),
    "confusionMatrix": cm,
    "matrixLabels": labels_order,
    "classificationReport": report_dict,
    "totalTestSamples": len(y_test)
}

with open(evaluation_path, "w") as f:
    json.dump(evaluation_data, f, indent=4)
print(f"Evaluation metrics saved to {evaluation_path}")

# Update model_info.json
info_path = os.path.join(os.path.dirname(__file__), "model_info.json")
model_info = {
    "accuracy": round(accuracy * 100, 2),
    "precision": round(precision * 100, 2),
    "recall": round(recall * 100, 2),
    "model": "Random Forest Multi-Class",
    "status": "trained",
    "categories": valid_categories
}
with open(info_path, "w") as f:
    json.dump(model_info, f, indent=4)
print(f"Model information saved to {info_path}")