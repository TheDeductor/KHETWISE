# 🌾 Khetwise

**We tell you what's attacking crops near you before it reaches yours — and when to sell for maximum price.**

Khetwise is a community-driven crop intelligence platform built specifically for Indian farmers. It moves beyond basic chatbots and weather apps to provide a complete end-to-end loop: detecting crop diseases, warning neighboring farmers of outbreaks, calculating exact irrigation needs using real agronomic data, and showing live market prices to maximize profit.

---

## ✨ Core Features

### 🐛 1. Community Outbreak Heatmap
Instead of fighting diseases alone, Khetwise connects farmers. When a disease is detected by any user on the platform, it instantly appears as a red dot on the **Pest Outbreak Heatmap** for everyone else in a 100km radius. 
* **Term to know:** *Heatmap* — A visual map showing where diseases are spreading, with color-coded risk levels based on how recent and how close the outbreak is.

### 📸 2. AI Disease Detection
Take a photo of a sick leaf, and our AI (powered by Google Gemini Vision) analyzes it in seconds. 
* **How it works:** It identifies the exact disease, gives a confidence score, and provides a 2-3 step actionable treatment plan. It also provides direct links to buy the necessary treatments online (e.g., DeHaat, BigHaat).

### 💧 3. Real ET0-Based Irrigation Advisor
Most apps just say "It will rain tomorrow." Khetwise does the math. 
* **Term to know:** *ET0 (Evapotranspiration)* — The exact amount of water evaporating from the soil and sweating from the plant. 
* **How it works:** We calculate your field's exact daily water deficit (ET0 × Crop Factor - Rainfall) and tell you exactly how many liters of water to pump, preventing over-watering and saving electricity costs.

### 📈 4. Market Intelligence
Don't settle for the middleman's price. Select your crop, and Khetwise compares the local Mandi (market) price with the nearest major market. It calculates your potential extra income so you know exactly where to transport your harvest for maximum profit.

### 🎙️ 5. Voice Assistant
Typing is slow. Farmers can tap a button and speak/type questions like *"Should I irrigate today?"* or *"How do I treat Blossom End Rot?"*. The AI responds instantly and reads the answer aloud using the built-in Voice Assistant.

---

## 🛠️ Tech Stack

This project is built using a modern, scalable architecture:

* **Frontend:** Next.js 14, React, Tailwind CSS, Recharts (for graphs), Leaflet (for maps).
* **Backend:** FastAPI (Python), Uvicorn.
* **Database:** Supabase (PostgreSQL) for real-time syncing of fields and disease reports.
* **AI & Data:** Google Gemini 2.5 Flash (for image analysis and voice responses), Open-Meteo API (for real-time weather and ET0 data).

---

## 🚀 Running Khetwise Locally

### Prerequisites
* Python 3.11+
* Node.js 18+
* A [Supabase](https://supabase.com/) account
* A [Google AI Studio](https://aistudio.google.com/) API Key

### 1. Database Setup
1. Create a new Supabase project.
2. Open the SQL Editor in Supabase.
3. Copy and run the contents of `docs/supabase_schema.sql` to create the tables.

### 2. Environment Variables
Copy `.env.example` to a new file named `.env` in the root folder and add your keys:
```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Start the Backend
```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt

# (Optional) Seed the database with sample outbreak data
python seed.py 

# Start the API server
uvicorn main:app --reload --port 8000
```

### 4. Start the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
# Ensure .env.local exists with NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```
Visit **http://localhost:3000** in your browser!

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
