import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Google GenAI initialized successfully.");
  } catch (err) {
    console.error("Error initializing Google GenAI:", err);
  }
} else {
  console.warn("GEMINI_API_KEY not set or contains default placeholder. AI features will run in mock mode.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Basic CORS so the frontend can call this server from any dev origin
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
  });

  // Health-check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      backend: "node-express",
      environmentKeys: {
        gemini: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
        openai: Boolean(process.env.OPENAI_API_KEY),
      },
    });
  });

  // Grounding Context for CEC (College of Engineering Chengannur)
  const CEC_GROUNDING_CONTEXT = `
You are the "CEC Portal Intelligent Assistant", an AI helper integrated into the official student portal of the College of Engineering Chengannur (CEC), Kerala, India.
You help S6 Computer Science student Arjun Nair and other students with queries about academic resources, syllabus, hostel guidelines, administrative procedures, and placements.

Your personality is professional, scholarly, friendly, and helpful. You speak clearly and avoid filler words. You should provide precise answers, formatting with markdown where appropriate (like lists or bold text).

Here is the authoritative ground truth information about CEC and S6 Computer Science:
1. ACADEMICS:
   - S6 Computer Science (CS) subjects:
     * CS302: Data Analysis (Core class: Room 402, Instructor: Dr. Mini Joseph, Time: 10:30 AM). Syllabus includes Exploratory Data Analysis, Statistical Inference, Regression, and R/Python tools.
     * CS304: Advanced Machine Learning (Elective selection, currently pending HOD approval).
     * CS306: Computer Networks.
     * CS308: Software Engineering.
   - CGPA of Arjun Nair: 8.4 (Top 10% of S6 batch).
   - Current Semester: Semester 6 (Academic Year 2023-2024).

2. HOSTEL GUIDELINES:
   - Hostel accommodation: Block B, Room 304.
   - Hostel warden: Prof. K. Harikumar.
   - Leave procedure: Students must submit a leave request 24 hours in advance. For out-of-campus overnight stay, local guardian or parent email confirmation is required.
   - Maintenance requests: Can be raised via the portal. Common issues: Water leakage, electrical repairs, Wi-Fi connectivity. Water leakage in Block B, Room 304 was recently resolved yesterday at 4:30 PM.

3. COURSE REGISTRATION:
   - Elective registration is currently open. CS302 Core is pre-registered. S6 Elective options include:
     * CS302: Advanced Machine Learning
     * CS304: Cloud Computing
     * CS306: Cryptography & Network Security
   - Status of Arjun's elective CS302 Registration is currently "Pending" and "Awaiting HOD Approval".

4. PLACEMENT CELL:
   - CEC has an active Career Guidance & Placement Unit (CGPU).
   - Major recruiters include TCS, Infosys, Cognizant, Wipro, UST, and Quest Global.
   - Placement schedule is updated regularly on the dashboard. Arjun Nair has no active placement applications yet, but can query the schedule.

5. PORTAL REQUEST TYPES available for students:
   - Hostel Maintenance: Raise complaints about room/block facilities.
   - Course Elective Selection: Apply for S6 electives.
   - Hostel Leave Request: Apply for leaves or late-entry permission.
   - Fee Payment Grievance: Resolve pending fees issues (current pending fees: ₹2,400).

Whenever a student asks you to write or draft a leave application or grievance mail, format a professional draft for them with placeholders for them to fill.
If a student asks a query, do your best to answer based on the info above. If it's outside this info, use general engineering education guidelines but remind them to consult with the college administration or HOD if it's a specific official procedure.
  `;

  // API Route: AI Chat Helper
  app.post("/api/chat", async (req, res) => {
    const { message, history, provider, apiKey } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Helper to generate fallback responses when in mock mode
    const getMockReply = (msg: string) => {
      const lower = msg.toLowerCase();
      if (lower.includes("syllabus") || lower.includes("cs302")) {
        return `**CS302: Data Analysis Syllabus Overview**\n\nThe CS302 course covers fundamental techniques for interpreting data. Key areas include:\n\n1. **Exploratory Data Analysis (EDA):** Summarizing main characteristics, data cleaning, and plotting.\n2. **Statistical Inference:** Estimation, hypothesis testing, and confidence intervals.\n3. **Regression Analysis:** Linear and multiple regression models.\n4. **Hands-on Tools:** Practical implementation using Python (Pandas/NumPy) and R.\n\n*Class Timing:* 10:30 AM in **Room 402** with Dr. Mini Joseph. Would you like me to help you prepare a study plan?`;
      } else if (lower.includes("leave") || lower.includes("hostel")) {
        return `**Hostel Leave application Guidelines:**\n\nTo apply for a leave from the CEC Hostel (Block B):\n1. Submit a formal request 24 hours in advance using the *My Requests* tab on this portal.\n2. Get approval from Warden Prof. K. Harikumar.\n\nHere is a draft you can copy and submit:\n\n\`\`\`\nTo,\nThe Warden, Block B Hostel\nCollege of Engineering Chengannur\n\nRespected Sir,\nI am Arjun Nair, room 304. I request permission to leave the hostel from [Start Date] to [End Date] due to [Reason]. My parents are aware of this travel.\n\nThank you.\nArjun Nair\n\`\`\`\n\nWould you like me to draft an email for your parents?`;
      } else if (lower.includes("placement") || lower.includes("job") || lower.includes("schedule")) {
        return `**CEC Career Guidance & Placement Unit (CGPU) Update:**\n\nThe upcoming S6 placement schedule includes:\n- **TCS Ninja/Digital Hiring:** Registration opens next week. Eligibility: CGPA > 7.0, no active backlogs.\n- **Infosys HackWithInfy:** Registrations close on August 15th.\n- **Mock Technical & HR Interviews:** Scheduled by CGPU on coming Saturday at 9:30 AM in the Seminar Hall.\n\nYour current CGPA is **8.4**, which places you in the top 10% of S6 batch! You are eligible for all major tech drives. I recommend practicing DSA on LeetCode. Let me know if you need mock questions!`;
      } else {
        return `Hi Arjun! As your CEC Portal assistant, I can help you with registration status, hostel maintenance, course syllabus, or CGPU placement updates. Let me know what you need help with!`;
      }
    };

    const targetProvider = provider || "gemini";
    const userApiKey = apiKey && apiKey.trim() !== "" ? apiKey : null;

    // Handle ChatGPT (OpenAI API)
    if (targetProvider === "chatgpt") {
      const oaiKey = userApiKey || process.env.OPENAI_API_KEY;
      if (!oaiKey) {
        console.log("Running ChatGPT in mock mode (no API key provided).");
        return res.json({ text: getMockReply(message) + "\n\n*(Note: Running in Mock Mode because ChatGPT API Key is not set)*" });
      }

      try {
        const messages = [
          { role: "system", content: CEC_GROUNDING_CONTEXT },
        ];
        if (history && Array.isArray(history)) {
          history.forEach((h: { role: string; content: string }) => {
            messages.push({
              role: h.role === "assistant" ? "assistant" : "user",
              content: h.content,
            });
          });
        }
        messages.push({ role: "user", content: message });

        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${oaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
          }),
        });

        if (!openaiResponse.ok) {
          const errorData = await openaiResponse.json().catch(() => ({}));
          throw new Error(`OpenAI API returned status ${openaiResponse.status}: ${JSON.stringify(errorData)}`);
        }

        const data: any = await openaiResponse.json();
        const replyText = data.choices?.[0]?.message?.content || "No response content from ChatGPT.";
        return res.json({ text: replyText });
      } catch (err: any) {
        console.error("ChatGPT API error:", err);
        return res.status(500).json({ error: "Failed to communicate with ChatGPT: " + err.message });
      }
    }

    // Handle Local Ollama (Gemma 4 Local)
    if (targetProvider === "gemma_local") {
      const ollamaUrl = req.body.localEndpoint || "http://localhost:11434/api/generate";
      const ollamaModel = req.body.localModel || "gemma4:e4b";

      try {
        const conversationText = history && Array.isArray(history)
          ? history.map((h: { role: string; content: string }) => `${h.role === "assistant" ? "Assistant" : "Student"}: ${h.content}`).join("\n")
          : "";
        const fullPrompt = `${CEC_GROUNDING_CONTEXT}\n\n${conversationText}\nStudent: ${message}\nAssistant:`;

        const ollamaResponse = await fetch(ollamaUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: ollamaModel,
            prompt: fullPrompt,
            stream: false
          })
        });

        if (!ollamaResponse.ok) {
          throw new Error(`Ollama returned status ${ollamaResponse.status}`);
        }

        const data: any = await ollamaResponse.json();
        const replyText = data.response ?? data.text ?? data.output ?? "No response from local Ollama.";
        return res.json({ text: replyText });
      } catch (err: any) {
        console.error("Local Ollama error:", err);
        return res.status(500).json({ error: `Failed to communicate with local Ollama: ${err.message}. Make sure Ollama is running.` });
      }
    }

    // Handle Google Gemini / Gemma
    const googleKey = userApiKey || process.env.GEMINI_API_KEY;
    if (!googleKey || googleKey === "MY_GEMINI_API_KEY") {
      console.log(`Running ${targetProvider} in mock mode (no Google API key provided).`);
      return res.json({ 
        text: getMockReply(message) + `\n\n*(Note: Running in Mock Mode because ${targetProvider === "gemma" ? "Gemma" : "Gemini"} API Key is not set)*` 
      });
    }

    try {
      // Initialize dynamic GoogleGenAI client for this request
      const requestAi = new GoogleGenAI({
        apiKey: googleKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Map history into standard parts
      const contents: any[] = [
        {
          role: "user",
          parts: [{ text: CEC_GROUNDING_CONTEXT }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am ready to assist as the CEC Student Portal AI Assistant, grounded with the specified data." }],
        },
      ];

      // Add actual chat history
      if (history && Array.isArray(history)) {
        history.forEach((h: { role: string; content: string }) => {
          contents.push({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content }],
          });
        });
      }

      // Add current message
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      // Determine model based on provider choice.
      // Gemma 4 is hosted on the Gemini API under these two IDs only
      // (E2B/E4B on-device sizes aren't exposed via the hosted API):
      //   gemma-4-26b-a4b-it  (26B Mixture-of-Experts, ~4B active params)
      //   gemma-4-31b-it      (31B dense)
      const selectedModel = targetProvider === "gemma" ? "gemma-4-26b-a4b-it" : "gemini-2.5-flash";

      const response = await requestAi.models.generateContent({
        model: selectedModel,
        contents,
      });

      return res.json({ text: response.text });
    } catch (err: any) {
      console.error(`${targetProvider} API error:`, err);
      return res.status(500).json({ error: `Failed to communicate with ${targetProvider === "gemma" ? "Gemma" : "Gemini"} API: ` + err.message });
    }
  });

  // Serve static files in production / Vite middleware in dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
