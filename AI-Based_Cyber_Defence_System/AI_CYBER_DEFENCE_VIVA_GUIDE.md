# 🛡️ AI-Based Cyber Defence System — Complete Viva & Oral Exam Guide
*Curated for 3rd Year B.Tech / BE Computer Science & Cybersecurity Students*

---

## 📌 1. Project Overview & Elevator Pitch
> **"What is your project, and what problem does it solve?"**
> 
> "Our project is an **AI-Based Cyber Defence System** designed to detect and mitigate malicious network intrusions in real time. Traditional firewalls and Intrusion Detection Systems (IDS) rely on static, signature-based rules which fail to detect zero-day or polymorphic cyber threats. Our solution uses a **Supervised Random Forest Classifier trained on the benchmark NSL-KDD dataset** to classify incoming network packets into 5 classes: **Normal, DoS, Probe, R2L, and U2R** with **>99.8% accuracy**. It features a modern **MERN stack SOC dashboard**, **interactive live traffic simulation**, **Explainable AI (XAI) feature contribution analysis**, and **automated incident reporting**."

---

## 🧠 2. Core Machine Learning & AI Questions

### Q1: Why did you choose Random Forest instead of Deep Learning or SVM?
- **Tabular Data Superiority**: The NSL-KDD dataset is tabular/structured data (41 numerical and categorical features). Empirical studies (e.g. Grinsztajn et al., 2022) prove tree-based ensembles outperform deep neural networks on tabular datasets.
- **Explainability (XAI)**: Random Forest provides native **Gini-importance / Mean Decrease in Impurity (MDI)** metrics for every feature. This directly powers our Explainable AI (XAI) engine. Deep neural networks act as black boxes.
- **Low Latency (<5ms per packet)**: Network intrusion detection requires instantaneous classification. A trained forest of 100 trees executes inference in milliseconds without needing high-end GPUs.
- **Overfitting Resistance**: By combining multiple decorrelated decision trees through Bootstrap Aggregating (Bagging) and random feature subsets, Random Forest significantly reduces variance compared to single decision trees.

### Q2: What is the NSL-KDD dataset, and why not the original KDD Cup 99?
- The original **KDD Cup 99** suffered from severe flaws: **78% duplicate records in training** and **75% duplicate records in testing**. This biased models toward frequent attacks and skewed evaluation results.
- **NSL-KDD solves these issues**:
  - Removed all duplicate records.
  - Selected records with varying difficulty levels so algorithms are rigorously tested.
  - Contains **41 traffic features** (9 basic, 13 content-based, 9 time-based traffic features, and 10 host-based traffic features).

### Q3: What are the 4 Attack Categories in your model?
| Attack Class | Full Name | Real-World Example | Key Signature in Packet |
| :--- | :--- | :--- | :--- |
| **DoS** | Denial of Service | *Neptune (SYN Flood), Smurf, Back* | High `serror_rate`, high `count`, zero `dst_bytes`. |
| **Probe** | Surveillance / Reconnaissance | *Portsweep, IPsweep, Nmap* | High `dst_host_diff_srv_rate`, scanning many ports from one source. |
| **R2L** | Remote to Local | *Guess_passwd, FTP_write, Imap* | High `num_failed_logins`, guest login attempts without root shell. |
| **U2R** | User to Root | *Buffer_overflow, Rootkit, Loadmodule* | `root_shell` attempted, file creation in system directories. |

### Q4: How does Explainable AI (XAI) work in your dashboard?
- **Problem**: In Security Operations Centers (SOC), security analysts cannot trust a model's verdict without knowing *why* it was flagged.
- **Solution**: Our XAI engine extracts the Random Forest feature importances and maps them against the anomalous packet attributes:
  1. `dst_host_srv_serror_rate` (SYN error rate): Indicates incomplete TCP handshakes characteristic of SYN flood attacks.
  2. `src_bytes`: Abnormal spikes or zero-byte payload signatures.
  3. `dst_host_same_src_port_rate`: Indicates horizontal port scan reconnaissance.
  4. `diff_srv_rate`: Rapid connection switching across different network services.

---

## 🏗️ 3. System Architecture & Tech Stack

```
[ Incoming Network Traffic (CSV / Live Stream Simulator) ]
                           │
                           ▼
          [ Node.js & Express API Gateway (Port 5000) ]
            │                                     │
            ▼                                     ▼
[ Python ML Engine (Random Forest) ]      [ MongoDB Database ]
- Model: random_forest_model.pkl          - Alerts Collection
- NSL-KDD Feature Preprocessing           - Predictions Collection
- 5-Class Prediction & Probabilities      - User Profiles
            │                                     │
            └─────────────────┬───────────────────┘
                              ▼
            [ React + Vite SOC Frontend (Port 5173) ]
            ├── Real-time Waveform Monitor
            ├── Circular Confidence Gauge Meter
            ├── Risk & Consistency Factors Breakdown
            ├── Explainable AI (XAI) Bar Chart
            └── One-Click Incident Report Exporter (CSV)
```

- **Frontend**: React 18, Vite, CSS3 custom theming (Dark & Light Mode), SVG real-time waveforms.
- **Backend**: Node.js, Express, Multer (multipart dataset handling), Child Process execution for Python.
- **Machine Learning**: Python 3, Scikit-learn, Pandas, NumPy, Joblib.
- **Database**: MongoDB (Local `cyber_defence`) with in-memory fallback for high availability.

---

## 🎯 4. Live Demonstration Steps (For Your Presentation)

When presenting to your professors or evaluators, follow this flow:

1. **Dashboard (Overview)**:
   - Point out total records, detected threats, and traffic classification donut chart.
   - Show the theme toggle (Light / Dark mode).

2. **Live Traffic Stream Simulator**:
   - Navigate to **"Live Traffic"** tab.
   - Show the real-time animated SVG waveform tracking network packets.
   - Point out the rolling SOC packet feed table displaying protocol tags (`TCP`, `UDP`, `ICMP`) and latency. Click **Pause** and **Play** to show dynamic control.

3. **Dataset Tab (AI Verification & XAI Analysis)**:
   - Click **"Choose Dataset File"** $\rightarrow$ select `test_traffic_sample.csv` (pre-loaded 28-packet test suite).
   - Click **"Submit Dataset"**.
   - **Show the Analysis Layout**:
     - *Circular Gauge*: Demonstrates overall verification confidence (e.g. `61% AI Confidence` with `Manual Review Required`).
     - *Risk Factors*: Explain how DoS SYN Flood shows high severity, while data quality shows low severity.
     - *Explainable AI*: Show how `dst_host_srv_serror` and `src_bytes` explain why the traffic is flagged.
     - Click **"Export Report"** to download the CSV Incident Report.

4. **AI Prediction Tab (Single Packet Testing)**:
   - Click **"🟡 Quick Test: Probe / Port Scan"** or **"🔴 Quick Test: DoS Attack"**.
   - Show how the model predicts the attack with confidence percentage.
   - Scroll down to show the **Model Evaluation Confusion Matrix** validated on 25,195 test samples with **>99.8% accuracy**.

5. **Security Alerts & Notifications**:
   - Point out the notification bell with unread counter.
   - Show the real-time floating toast alerts and search filtering in the Security Alerts table.

---

## 💡 5. Top 5 Killer Viva Questions & Best Answers

1. **"What is the difference between an IDS and an IPS?"**
   > *Answer*: "An **IDS (Intrusion Detection System)** is passive—it monitors traffic, detects anomalies, and alerts administrators. An **IPS (Intrusion Prevention System)** is active—it can drop packets, block IP addresses, or reconfigure firewall rules automatically. Our system operates primarily as an intelligent AI-IDS with active mitigation capabilities like host quarantine and report export."

2. **"How did you handle categorical variables in NSL-KDD?"**
   > *Answer*: "NSL-KDD contains three categorical features: `protocol_type` (tcp, udp, icmp), `service` (http, ftp, etc.), and `flag` (SF, S0, REJ, etc.). We used **One-Hot Encoding** (`pd.get_dummies`), followed by feature alignment in `predict.py` to ensure input vectors match the exact column dimensions of the trained model."

3. **"What metric is most important in cybersecurity: Precision or Recall?"**
   > *Answer*: "**Recall** is generally more critical in intrusion detection because a False Negative (missing an actual cyberattack) can lead to catastrophic data breaches. However, **Precision** is also important to prevent 'Alert Fatigue' where SOC analysts are overwhelmed by false alarms. Our model achieves a balanced **F1-Score of 99.88%**."

4. **"How do you prevent data leakage during model training?"**
   > *Answer*: "We stratified our train-test split (`test_size=0.20`, `stratify=y`) to maintain class ratios, fit all encoders solely on the training distribution, and evaluated on unseen testing subsets."

5. **"What are future enhancements for this project?"**
   > *Answer*: "1. Integrating active Linux kernel `iptables` or eBPF hooks for sub-millisecond automated packet dropping.<br>2. Adding unsupervised anomaly detection (e.g., Isolation Forest or Autoencoders) to detect completely novel zero-day attacks that have never been seen in training datasets.<br>3. Deploying as a distributed microservice using Docker and Kubernetes."
