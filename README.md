# CEC Student Portal

A modern, intelligent student portal built for the College of Engineering Chengannur (CEC), Kerala. This application provides students with a seamless dashboard for academics, hostel management, course registration, and placement updates—supercharged by a **multi-provider AI assistant**.

## 🌟 Key Features

- **Dynamic Student Dashboard**: View courses, hostel status, administrative requests, and placement updates in one unified interface.
- **Multi-Provider AI Assistant**: A context-aware chatbot grounded in CEC's authoritative data. Switch seamlessly between different LLMs:
  - ⚡ **Google Gemini** (Gemini 2.5 Flash via API)
  - 🧠 **Google Gemma** (Gemma 2 27B via API)
  - 💬 **ChatGPT** (GPT-4o mini via API)
  - 📱 **On-Device AI** (Gemma 4 E4B / Gemini Nano via Chrome `ai.languageModel` API) — *Runs 100% locally with no backend required!*
- **Premium User Interface**: Built with React, Vite, and Tailwind CSS v4, featuring dark mode, glassmorphism, and responsive design.
- **Robust Backend**: A complete Flask Python backend that securely handles API proxying and cloud LLM execution.
- **Offline / Mock Mode**: Full fallback support when API keys are not provided.

---

## 🏗️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Backend**: Python 3, Flask, Google GenAI SDK
- **AI Integration**:
  - `@google/genai` (Server-side Gemini/Gemma)
  - `window.ai.languageModel` (Client-side Chrome Built-in AI)
  - `OpenAI REST API` (Server-side ChatGPT)

---

## 🚀 Getting Started

The project runs a Vite development server for the frontend and a Flask server for the backend.

### 1. Backend Setup (Flask)

Open a terminal and navigate to the backend directory:

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY and OPENAI_API_KEY if desired

# Start the Flask server (runs on port 5000)
python run.py
```

### 2. Frontend Setup (React/Vite)

Open a second terminal in the project root:

```bash
# Install Node.js dependencies
npm install

# Start the Vite dev server (runs on port 5173, proxies /api to Flask)
npm run dev
```

Visit `http://localhost:5173` (or the port shown in your terminal) to view the portal.

---

## 🤖 Configuring On-Device AI (Gemma 4 E4B)

To run the AI assistant **100% locally and privately** using Chrome's built-in AI, you do not need any API keys. However, you must enable the feature in your browser:

1. Use **Google Chrome version 138** or newer (Desktop).
2. Go to `chrome://flags`.
3. Search for and **Enable**:
   - `#prompt-api-for-gemini-nano`
   - `#optimization-guide-on-device-model`
4. Relaunch Chrome.
5. Go to `chrome://on-device-internals` to verify the model is downloaded and ready.
6. Open the portal, go to **Settings**, and select the **Gemma 4 E4B** card.

---

## 🔧 Production Build

To build the application for production:

```bash
npm run build
```

This will generate the static files in the `dist/` directory. You can then run the Flask server, and it will automatically serve the built frontend at `http://localhost:5000/`.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Aditya06vinod/CECPORTAL/issues).
