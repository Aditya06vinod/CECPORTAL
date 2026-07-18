import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import RequestsView from "./components/RequestsView";
import HostelView from "./components/HostelView";
import CourseRegView from "./components/CourseRegView";
import AdminView from "./components/AdminView";
import ChatAssistantPanel from "./components/ChatAssistantPanel";

import {
  INITIAL_REQUESTS,
  INITIAL_COURSES,
  HOSTEL_DATA,
  INITIAL_PROGRESS
} from "./data";
import { RequestItem, Course, AcademicProgress, ChatMessage, Reply, User } from "./types";
import LoginView from "./components/LoginView";

// Local Gemma server endpoint (e.g. Ollama running on your machine)
const LOCAL_GEMMA_ENDPOINT = "http://localhost:8000/api/generate";
const LOCAL_GEMMA_MODEL = "gemma3";

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("cec_current_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Base state
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem("cec_active_tab") || "dashboard";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Portal State Data
  const [requests, setRequests] = useState<RequestItem[]>(() => {
    const saved = localStorage.getItem("cec_requests");
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem("cec_courses");
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });
  const [progress, setProgress] = useState<AcademicProgress>(() => {
    const saved = localStorage.getItem("cec_progress");
    return saved ? JSON.parse(saved) : INITIAL_PROGRESS;
  });
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(() => {
    return localStorage.getItem("cec_selected_request_id") || "CEC-2311";
  });

  // AI Assistant Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("cec_chat_messages");
    return saved ? JSON.parse(saved) : [];
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("cec_dark_mode");
    return saved === "true";
  });

  // API Config State
  const [apiProvider, setApiProvider] = useState<"gemini" | "gemma" | "chatgpt" | "ondevice">((() => {
    return (localStorage.getItem("cec_api_provider") as any) || "gemini";
  }));
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem("cec_gemini_api_key") || "";
  });
  const [gemmaApiKey, setGemmaApiKey] = useState<string>(() => {
    return localStorage.getItem("cec_gemma_api_key") || "";
  });
  const [openaiApiKey, setOpenaiApiKey] = useState<string>(() => {
    return localStorage.getItem("cec_openai_api_key") || "";
  });

  // On-Device Gemma 4 E4B availability state
  const [onDeviceStatus, setOnDeviceStatus] = useState<"checking" | "available" | "unavailable">("checking");

  // Visibility states for API Keys
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGemmaKey, setShowGemmaKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);

  // Probe Chrome on-device AI availability on mount
  useEffect(() => {
    const checkOnDevice = async () => {
      try {
        const ai = (window as any).ai;
        if (!ai || !ai.languageModel) {
          setOnDeviceStatus("unavailable");
          return;
        }
        const capabilities = await ai.languageModel.capabilities();
        setOnDeviceStatus(capabilities?.available === "readily" ? "available" : "unavailable");
      } catch {
        setOnDeviceStatus("unavailable");
      }
    };
    checkOnDevice();
  }, []);

  // Synchronize state changes to localStorage
  useEffect(() => {
    localStorage.setItem("cec_dark_mode", String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("cec_current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("cec_current_user");
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("cec_active_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("cec_requests", JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem("cec_courses", JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem("cec_progress", JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    if (selectedRequestId) {
      localStorage.setItem("cec_selected_request_id", selectedRequestId);
    } else {
      localStorage.removeItem("cec_selected_request_id");
    }
  }, [selectedRequestId]);

  useEffect(() => {
    localStorage.setItem("cec_chat_messages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem("cec_api_provider", apiProvider);
  }, [apiProvider]);

  useEffect(() => {
    localStorage.setItem("cec_gemini_api_key", geminiApiKey);
  }, [geminiApiKey]);

  useEffect(() => {
    localStorage.setItem("cec_gemma_api_key", gemmaApiKey);
  }, [gemmaApiKey]);

  useEffect(() => {
    localStorage.setItem("cec_openai_api_key", openaiApiKey);
  }, [openaiApiKey]);

  // Auth/Tab synchronization effect: ensure students cannot access admin, and vice-versa
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "admin" && activeTab !== "admin" && activeTab !== "dashboard" && activeTab !== "requests" && activeTab !== "settings") {
        setActiveTab("admin");
      } else if (currentUser.role === "student" && activeTab === "admin") {
        setActiveTab("dashboard");
      }
    }
  }, [currentUser, activeTab]);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("cec_current_user");
    localStorage.removeItem("cec_active_tab");
    setActiveTab("dashboard");
  };

  // Permanent request deletion (Admin only)
  const handleDeleteRequest = (reqId: string) => {
    if (currentUser?.role !== "admin") {
      console.warn("Access Denied: Only Admins can delete requests.");
      return;
    }
    setRequests((prev) => prev.filter((r) => r.id !== reqId));
    if (selectedRequestId === reqId) {
      setSelectedRequestId(null);
    }
  };

  // Recalculate Attendance percentage dynamically when totalClasses updates
  const handlePayFees = () => {
    setProgress((prev) => ({
      ...prev,
      feesPending: 0
    }));
  };

  // Submit new request
  const handleSubmitRequest = (
    type: "hostel" | "course" | "leave" | "fees",
    title: string,
    desc: string
  ) => {
    const randomId = `CEC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRequest: RequestItem = {
      id: randomId,
      type,
      title,
      desc,
      status: "Pending",
      date: "Awaiting administrative review",
      icon:
        type === "hostel"
          ? "home_work"
          : type === "course"
          ? "app_registration"
          : type === "leave"
          ? "directions_walk"
          : "account_balance_wallet",
      replies: [
        {
          id: `rep-${Date.now()}`,
          sender: "student",
          senderName: currentUser?.name || "Student",
          text: desc,
          time: new Date().toLocaleString()
        }
      ]
    };

    setRequests((prev) => [newRequest, ...prev]);
    setSelectedRequestId(randomId);
    setActiveTab("requests");
  };

  // Submit student reply
  const handleSubmitReply = (reqId: string, text: string) => {
    const newReply: Reply = {
      id: `rep-${Date.now()}`,
      sender: "student",
      senderName: currentUser?.name || "Student",
      text,
      time: new Date().toLocaleString()
    };

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          return {
            ...r,
            replies: [...r.replies, newReply]
          };
        }
        return r;
      })
    );

    // Trigger realistic simulated AI assistant draft or administrative feedback
    setTimeout(() => {
      const simulatedReply: Reply = {
        id: `rep-sim-${Date.now()}`,
        sender: "ai",
        senderName: "CEC System AI Agent",
        text: `Drafted support notes regarding: "${text}". Administrative reviews run hourly. If urgent, request instant clearance in the Admin Simulator view in your portal.`,
        time: new Date().toLocaleString()
      };

      setRequests((prev) =>
        prev.map((r) => {
          if (r.id === reqId) {
            return {
              ...r,
              replies: [...r.replies, simulatedReply]
            };
          }
          return r;
        })
      );
    }, 1500);
  };

  // Admin simulation update status
  const handleUpdateRequestStatus = (
    reqId: string,
    status: "Resolved" | "Pending" | "Rejected",
    adminNote?: string
  ) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          const updatedReplies = [...r.replies];
          if (adminNote) {
            updatedReplies.push({
              id: `rep-admin-${Date.now()}`,
              sender: "admin",
              senderName: "Prof. Thomas Sebastian (HOD)",
              text: adminNote,
              time: new Date().toLocaleString()
            });
          }
          return {
            ...r,
            status,
            date:
              status === "Resolved"
                ? `Resolved today at ${new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}`
                : "Awaiting secondary counselor review",
            replies: updatedReplies
          };
        }
        return r;
      })
    );

    // Synchronize Course registrations if the request is for courses
    const targetRequest = requests.find((r) => r.id === reqId);
    if (targetRequest && targetRequest.type === "course") {
      // Find course matching name or title
      setCourses((prev) =>
        prev.map((c) => {
          if (targetRequest.title.includes(c.name) || targetRequest.title.includes(c.code)) {
            return {
              ...c,
              status: status === "Resolved" ? "Registered" : "Available"
            };
          }
          return c;
        })
      );
    }
  };

  // Submit quick course registration request
  const handleSubmitCourseRequest = (courseCode: string, courseName: string) => {
    handleSubmitRequest(
      "course",
      `Course Registration: ${courseCode} ${courseName}`,
      `Requesting S6 Elective enrollment for ${courseCode}: ${courseName}. My current academic progress is satisfactory.`
    );
  };

  // Send message to AI (on-device Gemma 4 E4B, local Gemma server, or backend API)
  const handleSendAIMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const nextMessages = [...chatMessages, userMsg];
    setChatMessages(nextMessages);
    setChatOpen(true);
    setIsGenerating(true);

    // ── On-Device path: Chrome ai.languageModel (Gemma 4 E4B / Gemini Nano) ──
    if (apiProvider === "ondevice") {
      const placeholderId = `ai-ondevice-${Date.now()}`;
      setChatMessages((prev) => [
        ...prev,
        {
          id: placeholderId,
          role: "assistant" as const,
          content: "",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);

      try {
        const ai = (window as any).ai;
        if (!ai?.languageModel) throw new Error("Chrome on-device AI not available.");

        const CEC_SYSTEM_PROMPT = `You are the "CEC Portal Intelligent Assistant", an AI helper integrated into the official student portal of the College of Engineering Chengannur (CEC), Kerala, India. You help S6 Computer Science student Arjun Nair with academic resources, syllabus, hostel, and placement queries. Be helpful and concise.`;

        const initialPrompts = [
          { role: "user" as const, content: CEC_SYSTEM_PROMPT },
          { role: "assistant" as const, content: "Understood! I am the CEC Portal Assistant, ready to help." },
          ...chatMessages.map((m) => ({
            role: m.role === "assistant" ? "assistant" as const : "user" as const,
            content: m.content
          }))
        ];

        const session = await ai.languageModel.create({ initialPrompts });
        const stream = session.promptStreaming(text);

        let accumulated = "";
        for await (const chunk of stream) {
          accumulated = chunk; // promptStreaming yields cumulative text
          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === placeholderId ? { ...m, content: accumulated } : m
            )
          );
        }
        session.destroy();
      } catch (err: any) {
        console.error("On-device AI error:", err);
        const errMsg = err?.message?.includes("not available")
          ? `⚠️ On-device Gemma 4 E4B is not available on this browser. Please switch to Chrome 138+ and ensure the on-device model is downloaded via **chrome://on-device-internals**. Falling back to mock mode.`
          : `⚠️ On-device inference failed: ${err.message}`;
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId ? { ...m, content: errMsg } : m
          )
        );
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // ── Local Gemma server path: hits http://localhost:8000/api/generate directly ──
    if (apiProvider === "gemma") {
      const CEC_SYSTEM_PROMPT = `You are the "CEC Portal Intelligent Assistant", an AI helper integrated into the official student portal of the College of Engineering Chengannur (CEC), Kerala, India. You help students with academic resources, syllabus, hostel, and placement queries. Be helpful and concise.`;

      const conversationText = nextMessages
        .map((m) => `${m.role === "assistant" ? "Assistant" : "Student"}: ${m.content}`)
        .join("\n");
      const fullPrompt = `${CEC_SYSTEM_PROMPT}\n\n${conversationText}\nAssistant:`;

      try {
        const res = await fetch(LOCAL_GEMMA_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: LOCAL_GEMMA_MODEL,
            prompt: fullPrompt,
            stream: false
          })
        });

        if (!res.ok) throw new Error("HTTP error " + res.status);

        const data = await res.json();
        // Ollama-style /api/generate returns { response: "..." } — adjust if your local server differs
        const replyText: string =
          data.response ?? data.text ?? data.output ?? "No response received from local Gemma server.";

        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setChatMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        console.error("Local Gemma fetch failed:", err);
        const errorMsg: ChatMessage = {
          id: `ai-err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ Couldn't reach the local Gemma server at ${LOCAL_GEMMA_ENDPOINT}. Make sure it's running and, if needed, CORS-enabled for this origin.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setChatMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // ── Cloud/backend path: Gemini / ChatGPT (via /api/chat serverless function) ──
    try {
      const historyPayload = chatMessages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const activeKey = apiProvider === "gemini" ? geminiApiKey : openaiApiKey;

      const res = await fetch("http://localhost:8000/api/generate" , {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          provider: apiProvider,
          apiKey: activeKey
        })
      });

      if (!res.ok) throw new Error("HTTP error " + res.status);

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.text || "I am processing your portal request. Let me know if you need specific templates.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("AI fetch failed, falling back to offline answer:", err);
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: "assistant",
        content: `Sorry ${currentUser?.name?.split(" ")[0] || "Student"}, I'm currently running in offline mock mode. For standard questions, try asking about: **Syllabus**, **Warden**, **Leave forms**, or **Placement CGPU schedule**!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger Chat Drawer with custom query
  const handleTriggerAIQuery = (query: string) => {
    handleSendAIMessage(query);
  };

  // Trigger Chat with custom Suggestion regarding a specific request
  const handleAISuggestionForRequest = (title: string, desc: string) => {
    const query = `Provide guidelines or draft a professional response regarding the request: "${title}" - Description: "${desc}"`;
    handleSendAIMessage(query);
  };

  // Get active requests count
  const unreadRequestCount = requests.filter((r) => r.status === "Pending").length;

  if (!currentUser) {
    return (
      <LoginView
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === "admin") {
            setActiveTab("admin");
          } else {
            setActiveTab("dashboard");
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex">
      
      {/* Slide-out Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-all cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="fixed left-0 top-0 h-full w-64 z-50 bg-white shadow-2xl md:hidden transition-transform animate-in slide-in-from-left duration-250">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
              onAskAI={() => {
                setChatOpen(true);
                setMobileMenuOpen(false);
              }}
              currentUser={currentUser}
              onLogout={handleLogout}
              unreadCount={unreadRequestCount}
            />
          </div>
        </>
      )}

      {/* Main Desktop Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAskAI={() => setChatOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        unreadCount={unreadRequestCount}
      />

      {/* Main Canvas view area */}
      <div className="flex-grow md:ml-64 flex flex-col min-h-screen">
        
        {/* Top AppBar */}
        <Header
          onSearch={handleTriggerAIQuery}
          onAskAI={() => setChatOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          unreadCount={unreadRequestCount}
          currentUser={currentUser}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />

        {/* Central screen content router */}
        <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full">
          
          {activeTab === "dashboard" && (
            <DashboardView
              requests={requests}
              progress={progress}
              onNavigateToTab={setActiveTab}
              onAskAIQuery={handleTriggerAIQuery}
              onSelectRequest={setSelectedRequestId}
              onPayFees={handlePayFees}
            />
          )}

          {activeTab === "requests" && (
            <RequestsView
              requests={requests}
              selectedRequestId={selectedRequestId}
              onSelectRequest={setSelectedRequestId}
              onSubmitRequest={handleSubmitRequest}
              onSubmitReply={handleSubmitReply}
              onAskAISuggestion={handleAISuggestionForRequest}
            />
          )}

          {activeTab === "hostel" && (
            <HostelView
              hostelData={HOSTEL_DATA}
              onSubmitLeaveRequest={(title, desc) => handleSubmitRequest("leave", title, desc)}
            />
          )}

          {activeTab === "course_reg" && (
            <CourseRegView
              courses={courses}
              onSubmitCourseRequest={handleSubmitCourseRequest}
            />
          )}

          {activeTab === "admin" && currentUser.role === "admin" && (
            <AdminView
              requests={requests}
              onUpdateRequestStatus={handleUpdateRequestStatus}
              onDeleteRequest={handleDeleteRequest}
            />
          )}

          {activeTab === "settings" && (
            <div className="bg-white border border-outline-variant/50 rounded-3xl p-8 shadow-md max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Header */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-2xl font-bold">settings</span>
                </div>
                <div>
                  <h3 className="font-headline font-black text-xl text-on-surface">Portal Preferences</h3>
                  <p className="text-xs text-outline font-medium">Configure LLM providers and local credentials for the CEC Assistant.</p>
                </div>
              </div>

              {/* Provider Selection Cards */}
              <div className="mb-8">
                <h4 className="text-xs font-black text-on-surface uppercase tracking-wider mb-3">
                  Select Active AI Engine
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Gemini Card */}
                  <button
                    onClick={() => setApiProvider("gemini")}
                    className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden select-none ${
                      apiProvider === "gemini"
                        ? "border-primary bg-primary/5 shadow-xs ring-2 ring-primary/20"
                        : "border-outline-variant/60 bg-surface hover:bg-surface-container-low"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        <span className="material-symbols-outlined text-sm block">auto_awesome</span>
                      </div>
                      {apiProvider === "gemini" && (
                        <span className="material-symbols-outlined text-sm text-primary font-bold">check_circle</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-on-surface mb-0.5">Google Gemini</span>
                    <span className="text-[10px] text-outline font-medium leading-tight">Gemini 2.5 Flash via API.</span>
                  </button>

                  {/* Gemma Card (local server) */}
                  <button
                    onClick={() => setApiProvider("gemma")}
                    className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden select-none ${
                      apiProvider === "gemma"
                        ? "border-primary bg-primary/5 shadow-xs ring-2 ring-primary/20"
                        : "border-outline-variant/60 bg-surface hover:bg-surface-container-low"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        <span className="material-symbols-outlined text-sm block">hub</span>
                      </div>
                      {apiProvider === "gemma" && (
                        <span className="material-symbols-outlined text-sm text-primary font-bold">check_circle</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-on-surface mb-0.5">Gemma (Local)</span>
                    <span className="text-[10px] text-outline font-medium leading-tight">localhost:8000/api/generate</span>
                  </button>

                  {/* ChatGPT Card */}
                  <button
                    onClick={() => setApiProvider("chatgpt")}
                    className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden select-none ${
                      apiProvider === "chatgpt"
                        ? "border-primary bg-primary/5 shadow-xs ring-2 ring-primary/20"
                        : "border-outline-variant/60 bg-surface hover:bg-surface-container-low"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        <span className="material-symbols-outlined text-sm block">forum</span>
                      </div>
                      {apiProvider === "chatgpt" && (
                        <span className="material-symbols-outlined text-sm text-primary font-bold">check_circle</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-on-surface mb-0.5">ChatGPT</span>
                    <span className="text-[10px] text-outline font-medium leading-tight">GPT-4o mini via API key.</span>
                  </button>

                  {/* On-Device Gemma 4 E4B Card */}
                  <button
                    onClick={() => setApiProvider("ondevice")}
                    className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden select-none ${
                      apiProvider === "ondevice"
                        ? "border-primary bg-primary/5 shadow-xs ring-2 ring-primary/20"
                        : "border-outline-variant/60 bg-surface hover:bg-surface-container-low"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                        <span className="material-symbols-outlined text-sm block">memory</span>
                      </div>
                      {apiProvider === "ondevice" && (
                        <span className="material-symbols-outlined text-sm text-primary font-bold">check_circle</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-on-surface mb-0.5">Gemma 4 E4B</span>
                    <span className="text-[10px] text-outline font-medium leading-tight mb-2">On-device, no API key.</span>
                    {/* Live availability badge */}
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      onDeviceStatus === "available"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : onDeviceStatus === "checking"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                    }`}>
                      {onDeviceStatus === "available" ? "✓ Ready" : onDeviceStatus === "checking" ? "…Checking" : "✗ Unavailable"}
                    </span>
                  </button>
                </div>
              </div>

              {/* API Keys / On-Device Info / Local Gemma Info Section */}
              {apiProvider === "ondevice" ? (
                /* On-Device Info Panel */
                <div className="mb-8 space-y-4">
                  <h4 className="text-xs font-black text-on-surface uppercase tracking-wider">
                    On-Device Engine Status
                  </h4>
                  <div className={`p-5 rounded-2xl border ${
                    onDeviceStatus === "available"
                      ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
                      : "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800"
                  }`}>
                    <div className="flex items-start gap-3">
                      <span className={`material-symbols-outlined text-2xl mt-0.5 ${
                        onDeviceStatus === "available" ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {onDeviceStatus === "available" ? "verified" : "error"}
                      </span>
                      <div className="flex-1">
                        <p className={`text-xs font-bold mb-1 ${
                          onDeviceStatus === "available" ? "text-emerald-800 dark:text-emerald-300" : "text-rose-800 dark:text-rose-300"
                        }`}>
                          {onDeviceStatus === "available"
                            ? "Gemma 4 E4B is ready — running 100% on-device"
                            : onDeviceStatus === "checking"
                            ? "Checking Chrome on-device model availability…"
                            : "On-device model not available on this browser"}
                        </p>
                        {onDeviceStatus !== "available" && (
                          <div className="text-[10px] text-rose-700 dark:text-rose-400 space-y-1.5 font-medium leading-relaxed">
                            <p>To enable Gemma 4 E4B native inference:</p>
                            <ol className="list-decimal ml-4 space-y-1">
                              <li>Open <strong>Chrome 138+</strong> (desktop)</li>
                              <li>Go to <code className="bg-rose-100 dark:bg-rose-900/50 px-1 py-0.5 rounded text-[9px] font-mono">chrome://flags</code></li>
                              <li>Enable <strong>#prompt-api-for-gemini-nano</strong></li>
                              <li>Enable <strong>#optimization-guide-on-device-model</strong></li>
                              <li>Relaunch Chrome, then visit <code className="bg-rose-100 dark:bg-rose-900/50 px-1 py-0.5 rounded text-[9px] font-mono">chrome://on-device-internals</code> to trigger model download</li>
                            </ol>
                          </div>
                        )}
                        {onDeviceStatus === "available" && (
                          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                            No API key or internet required. Inference runs entirely using your device's GPU/NPU. Private by design.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Highlight features */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: "lock", label: "100% Private", desc: "No data leaves your device" },
                      { icon: "bolt", label: "No API Key", desc: "Zero cost, zero setup" },
                      { icon: "wifi_off", label: "Works Offline", desc: "After initial download" }
                    ].map((f) => (
                      <div key={f.label} className="p-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-center">
                        <span className="material-symbols-outlined text-secondary text-base block mb-1">{f.icon}</span>
                        <p className="text-[10px] font-bold text-on-surface">{f.label}</p>
                        <p className="text-[9px] text-outline font-medium leading-tight mt-0.5">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : apiProvider === "gemma" ? (
                /* Local Gemma Server Info Panel */
                <div className="mb-8 space-y-4">
                  <h4 className="text-xs font-black text-on-surface uppercase tracking-wider">
                    Local Gemma Server
                  </h4>
                  <div className="p-5 rounded-2xl border bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-2xl mt-0.5 text-blue-600">dns</span>
                      <div className="flex-1">
                        <p className="text-xs font-bold mb-1 text-blue-800 dark:text-blue-300">
                          Connects directly to your local Gemma server
                        </p>
                        <p className="text-[10px] text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
                          Requests are sent to{" "}
                          <code className="bg-blue-100 dark:bg-blue-900/50 px-1 py-0.5 rounded text-[9px] font-mono">
                            {LOCAL_GEMMA_ENDPOINT}
                          </code>{" "}
                          using model <strong>{LOCAL_GEMMA_MODEL}</strong>. Make sure your local server (e.g. Ollama or llama.cpp)
                          is running on port 8000 and, if needed, has CORS enabled for this origin. No API key is required.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: "lock", label: "100% Private", desc: "Stays on your network" },
                      { icon: "bolt", label: "No API Key", desc: "Zero cost, zero setup" },
                      { icon: "speed", label: "Local Speed", desc: "No cloud round-trip" }
                    ].map((f) => (
                      <div key={f.label} className="p-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-center">
                        <span className="material-symbols-outlined text-secondary text-base block mb-1">{f.icon}</span>
                        <p className="text-[10px] font-bold text-on-surface">{f.label}</p>
                        <p className="text-[9px] text-outline font-medium leading-tight mt-0.5">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* API Keys Configuration Forms (Gemini / ChatGPT) */
                <div className="space-y-5 mb-8">
                  <h4 className="text-xs font-black text-on-surface uppercase tracking-wider">
                    Provider API Credentials
                  </h4>

                {/* Gemini API Key */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      Gemini API Key
                    </label>
                    <a
                      href="https://aistudio.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                    >
                      Get Key <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showGeminiKey ? "text" : "password"}
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="Enter Gemini API Key (starts with AIza...)"
                      className="w-full bg-surface-container-low border border-outline-variant/60 focus:border-primary rounded-xl pl-4 pr-12 py-3 text-xs font-mono focus:ring-2 focus:ring-primary/15 focus:outline-hidden text-on-surface"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors cursor-pointer"
                      title={showGeminiKey ? "Hide API Key" : "Show API Key"}
                    >
                      <span className="material-symbols-outlined text-sm block">
                        {showGeminiKey ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  <p className="text-[10px] text-outline">
                    Google AI Studio key. Leave blank to run in mock fallback mode.
                  </p>
                </div>

                {/* OpenAI (ChatGPT) API Key */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      OpenAI (ChatGPT) API Key
                    </label>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                    >
                      Get Key <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showOpenaiKey ? "text" : "password"}
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      placeholder="Enter OpenAI API Key (starts with sk-...)"
                      className="w-full bg-surface-container-low border border-outline-variant/60 focus:border-primary rounded-xl pl-4 pr-12 py-3 text-xs font-mono focus:ring-2 focus:ring-primary/15 focus:outline-hidden text-on-surface"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors cursor-pointer"
                      title={showOpenaiKey ? "Hide API Key" : "Show API Key"}
                    >
                      <span className="material-symbols-outlined text-sm block">
                        {showOpenaiKey ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  <p className="text-[10px] text-outline">
                    Required to connect to ChatGPT. Stored locally in your browser sandbox.
                  </p>
                </div>
              </div>
              )}

              {/* Status Indicator Bar (only shown for cloud key-based providers) */}
              {(apiProvider === "gemini" || apiProvider === "chatgpt") && (
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    (apiProvider === "gemini" && geminiApiKey) ||
                    (apiProvider === "chatgpt" && openaiApiKey)
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-amber-400"
                  }`}></span>
                  <div>
                    <p className="text-xs font-bold text-on-surface">
                      Status: {
                        ((apiProvider === "gemini" && geminiApiKey) ||
                         (apiProvider === "chatgpt" && openaiApiKey))
                          ? `Connected via custom ${apiProvider.toUpperCase()} Key`
                          : `Offline (Simulated fallback responses)`
                      }
                    </p>
                    <p className="text-[9px] text-outline font-medium mt-0.5">
                      Credentials are saved automatically in your browser's LocalStorage.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {((apiProvider === "gemini" && geminiApiKey) ||
                    (apiProvider === "chatgpt" && openaiApiKey)) && (
                    <button
                      onClick={() => {
                        if (apiProvider === "gemini") setGeminiApiKey("");
                        else if (apiProvider === "chatgpt") setOpenaiApiKey("");
                      }}
                      className="px-2.5 py-1 text-[10px] font-bold text-error border border-error/20 bg-error/5 hover:bg-error/10 hover:border-error rounded-lg cursor-pointer transition-all"
                    >
                      Clear Key
                    </button>
                  )}
                </div>
              </div>
              )}

              {/* Demographic section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-6">
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-1">
                  {currentUser.role === "admin" ? "Staff Details" : "Student Demographics"}
                </h4>
                <p className="text-xs text-slate-600 font-mono mt-1">
                  Name: {currentUser.name}<br />
                  ID Number: {currentUser.idNumber || "Not Configured"}<br />
                  Role: {currentUser.role === "admin" ? "Administrative Staff" : "B.Tech Computer Science Student"}<br />
                  {currentUser.role === "student" && currentUser.roomNumber && (
                    <>Hostel Room: {currentUser.roomNumber}<br /></>
                  )}
                  College: College of Engineering Chengannur
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setActiveTab(currentUser.role === "admin" ? "admin" : "dashboard")}
                  className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer select-none text-center shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Slide-out Persistent AI Assistant Side Drawer */}
      <ChatAssistantPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendAIMessage}
        isGenerating={isGenerating}
      />

    </div>
  );
}