"""
CEC Student Portal — Flask Backend
====================================
Mirrors the Express/Node server.ts with full support for:
  - Gemini 2.5 Flash  (Google GenAI SDK)
  - Gemma 2 27B-IT    (Google GenAI SDK, model override)
  - ChatGPT GPT-4o-mini (OpenAI SDK)
  - Mock fallback when no API keys are set

Run in development:
    python run.py
    or
    flask --app app run --port 5000 --debug

In production, point FLASK_STATIC_FOLDER to the Vite dist/ output directory.
"""

import os
import json
import logging
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from dotenv import load_dotenv

# ── Load environment variables ──────────────────────────────────────────────
load_dotenv()

# ── Logging ─────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ── App setup ────────────────────────────────────────────────────────────────
DIST_DIR = os.path.join(os.path.dirname(__file__), "..", "dist")

app = Flask(
    __name__,
    static_folder=DIST_DIR if os.path.exists(DIST_DIR) else None,
    static_url_path="",
)

# Allow CORS in dev so the Vite dev-server (port 5173) can talk to Flask (port 5000)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ── CEC Grounding Context ─────────────────────────────────────────────────────
CEC_GROUNDING_CONTEXT = """
You are the "CEC Portal Intelligent Assistant", an AI helper integrated into the
official student portal of the College of Engineering Chengannur (CEC), Kerala, India.
You help S6 Computer Science student Arjun Nair and other students with queries about
academic resources, syllabus, hostel guidelines, administrative procedures, and placements.

Your personality is professional, scholarly, friendly, and helpful.
You speak clearly and avoid filler words.
You should provide precise answers, formatting with markdown where appropriate
(like lists or bold text).

Here is the authoritative ground truth information about CEC and S6 Computer Science:

1. ACADEMICS:
   - S6 Computer Science (CS) subjects:
     * CS302: Data Analysis (Core class: Room 402, Instructor: Dr. Mini Joseph,
       Time: 10:30 AM). Syllabus includes Exploratory Data Analysis, Statistical
       Inference, Regression, and R/Python tools.
     * CS304: Advanced Machine Learning (Elective selection, currently pending HOD approval).
     * CS306: Computer Networks.
     * CS308: Software Engineering.
   - CGPA of Arjun Nair: 8.4 (Top 10% of S6 batch).
   - Current Semester: Semester 6 (Academic Year 2023-2024).

2. HOSTEL GUIDELINES:
   - Hostel accommodation: Block B, Room 304.
   - Hostel warden: Prof. K. Harikumar.
   - Leave procedure: Students must submit a leave request 24 hours in advance.
     For out-of-campus overnight stay, local guardian or parent email confirmation
     is required.
   - Maintenance requests: Can be raised via the portal. Common issues: Water leakage,
     electrical repairs, Wi-Fi connectivity.
     Water leakage in Block B, Room 304 was recently resolved yesterday at 4:30 PM.

3. COURSE REGISTRATION:
   - Elective registration is currently open. CS302 Core is pre-registered.
   - S6 Elective options include:
     * CS302: Advanced Machine Learning
     * CS304: Cloud Computing
     * CS306: Cryptography & Network Security
   - Status of Arjun's elective CS302 Registration is currently "Pending" and
     "Awaiting HOD Approval".

4. PLACEMENT CELL:
   - CEC has an active Career Guidance & Placement Unit (CGPU).
   - Major recruiters include TCS, Infosys, Cognizant, Wipro, UST, and Quest Global.
   - Placement schedule is updated regularly on the dashboard. Arjun Nair has no active
     placement applications yet, but can query the schedule.

5. PORTAL REQUEST TYPES available for students:
   - Hostel Maintenance: Raise complaints about room/block facilities.
   - Course Elective Selection: Apply for S6 electives.
   - Hostel Leave Request: Apply for leaves or late-entry permission.
   - Fee Payment Grievance: Resolve pending fees issues (current pending fees: ₹2,400).

Whenever a student asks you to write or draft a leave application or grievance mail,
format a professional draft for them with placeholders for them to fill.
If a student asks a query, do your best to answer based on the info above.
If it is outside this info, use general engineering education guidelines but remind
them to consult with the college administration or HOD if it's a specific official
procedure.
""".strip()


# ── Mock fallback helper ──────────────────────────────────────────────────────
def get_mock_reply(msg: str) -> str:
    lower = msg.lower()
    if "syllabus" in lower or "cs302" in lower:
        return (
            "**CS302: Data Analysis Syllabus Overview**\n\n"
            "The CS302 course covers fundamental techniques for interpreting data. Key areas include:\n\n"
            "1. **Exploratory Data Analysis (EDA):** Summarizing main characteristics, data cleaning, and plotting.\n"
            "2. **Statistical Inference:** Estimation, hypothesis testing, and confidence intervals.\n"
            "3. **Regression Analysis:** Linear and multiple regression models.\n"
            "4. **Hands-on Tools:** Practical implementation using Python (Pandas/NumPy) and R.\n\n"
            "*Class Timing:* 10:30 AM in **Room 402** with Dr. Mini Joseph. "
            "Would you like me to help you prepare a study plan?"
        )
    elif "leave" in lower or "hostel" in lower:
        return (
            "**Hostel Leave Application Guidelines:**\n\n"
            "To apply for a leave from the CEC Hostel (Block B):\n"
            "1. Submit a formal request 24 hours in advance using the *My Requests* tab on this portal.\n"
            "2. Get approval from Warden Prof. K. Harikumar.\n\n"
            "Here is a draft you can copy and submit:\n\n"
            "```\nTo,\nThe Warden, Block B Hostel\nCollege of Engineering Chengannur\n\n"
            "Respected Sir,\nI am Arjun Nair, room 304. I request permission to leave the hostel "
            "from [Start Date] to [End Date] due to [Reason]. My parents are aware of this travel.\n\n"
            "Thank you.\nArjun Nair\n```\n\nWould you like me to draft an email for your parents?"
        )
    elif "placement" in lower or "job" in lower or "schedule" in lower:
        return (
            "**CEC Career Guidance & Placement Unit (CGPU) Update:**\n\n"
            "The upcoming S6 placement schedule includes:\n"
            "- **TCS Ninja/Digital Hiring:** Registration opens next week. Eligibility: CGPA > 7.0, no active backlogs.\n"
            "- **Infosys HackWithInfy:** Registrations close on August 15th.\n"
            "- **Mock Technical & HR Interviews:** Scheduled by CGPU on coming Saturday at 9:30 AM in the Seminar Hall.\n\n"
            "Your current CGPA is **8.4**, which places you in the top 10% of S6 batch! "
            "You are eligible for all major tech drives. I recommend practising DSA on LeetCode. "
            "Let me know if you need mock questions!"
        )
    return (
        "Hi Arjun! As your CEC Portal assistant, I can help you with registration status, "
        "hostel maintenance, course syllabus, or CGPU placement updates. "
        "Let me know what you need help with!"
    )


# ── /api/chat endpoint ────────────────────────────────────────────────────────
@app.route("/api/chat", methods=["POST"])
def chat():
    body = request.get_json(silent=True) or {}

    message: str = body.get("message", "").strip()
    history: list = body.get("history", [])
    provider: str = body.get("provider", "gemini").lower()
    api_key: str = (body.get("apiKey") or "").strip()

    if not message:
        return jsonify({"error": "Message is required."}), 400

    # Resolve which key to use (client-supplied beats env var)
    user_api_key = api_key or None

    # ── ChatGPT (OpenAI) ─────────────────────────────────────────────────────
    if provider == "chatgpt":
        return _handle_openai(message, history, user_api_key)

    # ── Google Gemini / Gemma ─────────────────────────────────────────────────
    return _handle_google(message, history, provider, user_api_key)


def _handle_openai(message: str, history: list, user_api_key: str | None):
    """Route the chat request through the OpenAI API (ChatGPT)."""
    import requests as req

    oai_key = user_api_key or os.getenv("OPENAI_API_KEY", "")
    if not oai_key:
        log.warning("Running ChatGPT in mock mode (no API key provided).")
        return jsonify({
            "text": get_mock_reply(message) +
                    "\n\n*(Note: Running in Mock Mode because ChatGPT API Key is not set)*"
        })

    messages = [{"role": "system", "content": CEC_GROUNDING_CONTEXT}]
    for h in history:
        role = "assistant" if h.get("role") == "assistant" else "user"
        messages.append({"role": role, "content": h.get("content", "")})
    messages.append({"role": "user", "content": message})

    try:
        resp = req.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {oai_key}",
            },
            json={"model": "gpt-4o-mini", "messages": messages},
            timeout=60,
        )
        resp.raise_for_status()
        data = resp.json()
        reply_text = data["choices"][0]["message"]["content"]
        return jsonify({"text": reply_text})
    except Exception as e:
        log.error("ChatGPT API error: %s", e)
        return jsonify({"error": f"Failed to communicate with ChatGPT: {e}"}), 500


def _handle_google(message: str, history: list, provider: str, user_api_key: str | None):
    """Route the chat request through the Google GenAI SDK (Gemini or Gemma)."""
    google_key = user_api_key or os.getenv("GEMINI_API_KEY", "")

    if not google_key or google_key == "MY_GEMINI_API_KEY":
        model_name = "Gemma" if provider == "gemma" else "Gemini"
        log.warning("Running %s in mock mode (no Google API key provided).", model_name)
        return jsonify({
            "text": get_mock_reply(message) +
                    f"\n\n*(Note: Running in Mock Mode because {model_name} API Key is not set)*"
        })

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=google_key)

        # Build contents list with grounding context first
        contents = [
            types.Content(
                role="user",
                parts=[types.Part(text=CEC_GROUNDING_CONTEXT)],
            ),
            types.Content(
                role="model",
                parts=[types.Part(
                    text="Understood. I am ready to assist as the CEC Student Portal "
                         "AI Assistant, grounded with the specified data."
                )],
            ),
        ]

        # Append conversation history
        for h in history:
            role = "model" if h.get("role") == "assistant" else "user"
            contents.append(
                types.Content(role=role, parts=[types.Part(text=h.get("content", ""))])
            )

        # Append the current user message
        contents.append(
            types.Content(role="user", parts=[types.Part(text=message)])
        )

        selected_model = "gemma-2-27b-it" if provider == "gemma" else "gemini-2.5-flash"
        log.info("Calling Google GenAI model: %s", selected_model)

        response = client.models.generate_content(
            model=selected_model,
            contents=contents,
        )
        return jsonify({"text": response.text})

    except Exception as e:
        model_label = "Gemma" if provider == "gemma" else "Gemini"
        log.error("%s API error: %s", model_label, e)
        return jsonify({"error": f"Failed to communicate with {model_label} API: {e}"}), 500


# ── Health-check endpoint ─────────────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    env_keys = {
        "gemini": bool(os.getenv("GEMINI_API_KEY")),
        "openai": bool(os.getenv("OPENAI_API_KEY")),
    }
    return jsonify({
        "status": "ok",
        "backend": "Flask",
        "environment_keys": env_keys,
    })


# ── Static SPA serving (production) ──────────────────────────────────────────
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_spa(path):
    """Serve the Vite-built React SPA for any non-API route."""
    if not app.static_folder or not os.path.exists(app.static_folder):
        return (
            "<h2>Flask API is running.</h2>"
            "<p>Build the React frontend with <code>npm run build</code>, "
            "then restart Flask to serve the full app.</p>",
            200,
        )
    # Serve file if it exists, otherwise fall back to index.html (SPA routing)
    target = os.path.join(app.static_folder, path)
    if path and os.path.exists(target):
        return send_from_directory(app.static_folder, path)
    return send_file(os.path.join(app.static_folder, "index.html"))
