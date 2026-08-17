# Lost & Found Local AI Service & Static Ngrok Tunnel Setup

This directory contains the hybrid AI matching engine (combining OpenAI CLIP-Large openai/clip-vit-large-patch14 768-dim discriminative visual embeddings, sentence-transformers text embeddings, EasyOCR, YOLO object detection, and color/date/location metadata scoring) for the Daffodil Lost & Found System.

---

## 🚀 Quick Start (Complete Process)

### 1. Install Dependencies
Open terminal in the `aiService` directory and install Python dependencies:
```bash
pip install -r requirements.txt
```

### 2. Download Pre-trained Models
Run the pre-downloader script to cache OpenAI CLIP-Large, Google SigLIP, all-mpnet-base-v2, and EasyOCR models locally:
```bash
python download_models.py
```

### 3. Start AI Service & Ngrok Tunnel

#### Option A: One-Command Launcher (Python)
```bash
python start_all.py
```

#### Option B: Separate Terminals

1. **Terminal 1 - FastAPI AI Server:**
   ```bash
   python app.py
   ```
   *Runs locally on `http://localhost:5000` (Interactive Docs: `http://localhost:5000/docs`).*

2. **Terminal 2 - Static Ngrok Tunnel:**
   ```bash
   ngrok http --url=requisite-frolic-perkiness.ngrok-free.dev 5000
   ```
   *(or double click `start_tunnel.bat` on Windows)*

---

## ⚙️ Server Configuration (`server/.env`)

Ensure the Node.js backend `.env` contains the static ngrok URL:
```env
AI_SERVICE_URL=https://requisite-frolic-perkiness.ngrok-free.dev
```

The Node.js backend handles Ngrok free tier browser warning pages automatically by sending the `ngrok-skip-browser-warning: true` HTTP header.

---

## 🔍 Features & Admin Verification

1. **Automatic Background AI Matching**:
   When a user reports a Lost or Found item, the backend automatically triggers `triggerAIMatching()`, which calls `/match` on the AI service to calculate multi-modal similarity scores across candidates and saves match suggestions (score ≥ 0.80).

2. **Admin Panel "Verify Owner" Modal**:
   In the Admin Panel under **Found Items**, clicking **Verify Owner** hits `/items/found/:id/check-match`, which queries the local AI service over the Ngrok tunnel, retrieves the top matching lost item + owner details, and displays the similarity score and verification modal.