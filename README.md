# CEC Portal

## Problem Statement

University student portals are often fragmented, outdated, and difficult to navigate. Students struggle to find authoritative answers about their syllabus, hostel guidelines, administrative procedures, and placement schedules. They often have to navigate through multiple disconnected systems or wait for manual responses from staff to get their issues resolved.

## Project Description

CEC Portal is a modern, unified dashboard built for the students of College of Engineering Chengannur (CEC). It provides a seamless interface for academic details, course registration, hostel management, and placement updates. What makes it unique is the integration of a **multi-provider AI Assistant** grounded in the university's authoritative data. The assistant can instantly answer student queries, draft official leave/grievance requests, and guide them through procedures, significantly reducing administrative friction and empowering students with immediate, accurate information.

---

## Google AI Usage

### Tools / Models Used

- Google GenAI SDK
- Gemini 2.5 Flash
- Gemma 2 27B
- Gemma 4 E4B (On-Device via Chrome `ai.languageModel` API)

## Tech Stack used

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Backend**: Python 3, Flask
- **Deployment & Tooling**: Node.js, npm, pip

### How Google AI Was Used

Google AI is the core intelligence engine of the CEC Portal. We integrated the Google GenAI SDK in our Flask backend to route conversational queries to either **Gemini 2.5 Flash** (for general, fast reasoning) or **Gemma 4** (for lightweight, specialized tasks). 

Furthermore, we heavily utilized Chrome's native **On-Device AI capabilities**. By leveraging the `window.ai.languageModel` API, we run **Gemma 4 E4B** directly in the browser's sandbox using the device's NPU/GPU. This allows the student portal assistant to function 100% locally and privately, requiring no backend API keys or internet connection once the model is downloaded.

---

### GitHub repo link of the project

[Link of the github repository](https://github.com/Aditya06vinod/CECPORTAL)


## Proof of Google AI Usage

Please check the `/proofs` folder for code snippets and architectural logs demonstrating our integration with Google GenAI and Chrome on-device AI.

## Screenshots

Please check the `/screenshots` folder for visual demonstrations of the CEC Portal dashboard, settings, and AI chat interactions.

---

## Demo Video

Upload your demo video to Google Drive and paste the shareable link here(max 3 minutes). [Watch Demo](https://drive.google.com/...)

---

## Installation Steps

### 1. Backend Setup (Flask)
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env # Add your GEMINI_API_KEY
python run.py # Runs on port 5000
```

### 2. Frontend Setup (React/Vite)
Open a second terminal in the project root:
```bash
npm install
npm run dev # Runs on port 5173, proxies /api to Flask
```

### 3. On-Device AI Setup (Optional)
To use Gemma 4 E4B locally without API keys:
1. Open Chrome 138+ (Desktop)
2. Go to `chrome://flags` and enable `#prompt-api-for-gemini-nano` and `#optimization-guide-on-device-model`
3. Relaunch and visit `chrome://on-device-internals` to download the model.
