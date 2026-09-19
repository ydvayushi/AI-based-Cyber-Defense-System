import sys
import os
import json
import argparse
import pandas as pd
import numpy as np
import joblib

MODEL_PATH = os.path.join(os.path.dirname(__file__), "random_forest_model.pkl")

COLUMNS = [
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
    "dst_host_rerror_rate", "dst_host_srv_rerror_rate"
]

CATEGORICAL_COLUMNS = ["protocol_type", "service", "flag"]

def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Train the model first.")
    return joblib.load(MODEL_PATH)

def preprocess_and_align(df, expected_features):
    # Ensure categorical columns exist or fill default
    for col in CATEGORICAL_COLUMNS:
        if col not in df.columns:
            df[col] = "unknown"
            
    # One-hot encode
    df_encoded = pd.get_dummies(df, columns=[col for col in CATEGORICAL_COLUMNS if col in df.columns])
    
    # Reindex columns to match training features exactly (fill missing dummy columns with 0)
    aligned_df = df_encoded.reindex(columns=expected_features, fill_value=0)
    return aligned_df

def predict_single(data, model_data):
    model = model_data["model"]
    features = model_data["features"]
    
    if isinstance(data, dict):
        df = pd.DataFrame([data])
    else:
        df = pd.DataFrame(data)
        
    X = preprocess_and_align(df, features)
    pred_class = model.predict(X)[0]
    
    # Probabilities & confidence
    confidence = 1.0
    probabilities = {}
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X)[0]
        for cls_name, prob in zip(model.classes_, probs):
            probabilities[str(cls_name)] = round(float(prob), 4)
        confidence = round(float(np.max(probs)), 4)
        
    result_binary = "Normal" if pred_class == "Normal" else "Attack"
    
    return {
        "status": "success",
        "result": result_binary,
        "attackType": str(pred_class),
        "confidence": confidence,
        "probabilities": probabilities
    }

def predict_file(file_path, model_data):
    model = model_data["model"]
    features = model_data["features"]
    
    if not os.path.exists(file_path):
        return {"status": "error", "message": f"File not found: {file_path}"}
        
    # Attempt to read CSV / TXT
    try:
        # Check first line to detect if header exists
        first_line = ""
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            first_line = f.readline().strip()
            
        first_tokens = [t.strip() for t in first_line.split(",")]
        
        # If headers match known numeric/string data or column names
        if "duration" in first_tokens or "protocol_type" in first_tokens:
            df = pd.read_csv(file_path)
        else:
            # Assume NSL-KDD format
            if len(first_tokens) >= 41:
                df = pd.read_csv(file_path, names=COLUMNS, header=None, usecols=range(len(COLUMNS)))
            else:
                df = pd.read_csv(file_path)
    except Exception as e:
        return {"status": "error", "message": f"Error reading file: {str(e)}"}
        
    total_records = len(df)
    if total_records == 0:
        return {"status": "error", "message": "Uploaded file is empty."}
        
    X = preprocess_and_align(df, features)
    predictions = model.predict(X)
    
    counts = {
        "Normal": 0,
        "DoS": 0,
        "Probe": 0,
        "R2L": 0,
        "U2R": 0,
        "Other": 0
    }
    
    for p in predictions:
        p_str = str(p)
        if p_str in counts:
            counts[p_str] += 1
        else:
            counts["Other"] += 1
            
    normal_count = counts["Normal"]
    attack_count = total_records - normal_count
    
    # Generate sample preview for first 100 rows
    preview_limit = min(100, total_records)
    samples = []
    for i in range(preview_limit):
        pred_cat = str(predictions[i])
        samples.append({
            "id": i + 1,
            "attackType": pred_cat,
            "result": "Normal" if pred_cat == "Normal" else "Attack",
            "protocol": str(df.iloc[i].get("protocol_type", "N/A")),
            "service": str(df.iloc[i].get("service", "N/A"))
        })
        
    return {
        "status": "success",
        "totalRecords": total_records,
        "normalCount": normal_count,
        "attackCount": attack_count,
        "breakdown": {
            "DoS": counts["DoS"],
            "Probe": counts["Probe"],
            "R2L": counts["R2L"],
            "U2R": counts["U2R"],
            "Normal": counts["Normal"]
        },
        "samples": samples
    }

def main():
    parser = argparse.ArgumentParser(description="Cyber Defence AI Prediction Engine")
    parser.add_argument("--json", type=str, help="JSON string with network record features")
    parser.add_argument("--file", type=str, help="File path to CSV/TXT dataset to predict")
    
    args = parser.parse_args()
    
    try:
        model_data = load_model()
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))
        sys.exit(1)
        
    if args.json:
        try:
            input_dict = json.loads(args.json)
            result = predict_single(input_dict, model_data)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"status": "error", "message": f"Prediction error: {str(e)}"}))
            sys.exit(1)
    elif args.file:
        try:
            result = predict_file(args.file, model_data)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"status": "error", "message": f"File prediction error: {str(e)}"}))
            sys.exit(1)
    else:
        # Check stdin
        try:
            raw_input = sys.stdin.read().strip()
            if raw_input:
                input_dict = json.loads(raw_input)
                result = predict_single(input_dict, model_data)
                print(json.dumps(result))
            else:
                print(json.dumps({"status": "error", "message": "No input provided. Provide --json or --file."}))
        except Exception as e:
            print(json.dumps({"status": "error", "message": f"Input error: {str(e)}"}))
            sys.exit(1)

if __name__ == "__main__":
    main()
