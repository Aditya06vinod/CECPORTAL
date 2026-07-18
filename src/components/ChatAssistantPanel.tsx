import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";

interface ChatAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isGenerating: boolean;
}

export default function ChatAssistantPanel({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isGenerating
}: ChatAssistantPanelProps) {
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isGenerating, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isGenerating) {
      onSendMessage(inputText);
      setInputText("");
    }
  };

  const suggestionChips = [
    "What is the syllabus of CS302?",
    "Draft a leave form for next weekend",
    "How can I resolve my pending fees?",
    "When is the TCS placement drive?"
  ];

  // Helper to safely format simple markdown tags (bold, lists, code blocks) into JSX
  const formatMessageText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let content: React.ReactNode = line;
      
      // Check for code block backticks
      if (line.startsWith("```")) {
        return null; // Skip boundary backticks
      }

      // Check for bullet list
      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        const raw = line.trim().slice(2);
        content = (
          <li className="list-disc ml-4 pl-1 font-sans">
            {formatBoldText(raw)}
          </li>
        );
      }
      // Check for numbered list
      else if (/^\d+\.\s/.test(line.trim())) {
        const match = line.trim().match(/^(\d+)\.\s(.*)/);
        if (match) {
          content = (
            <div className="flex gap-1.5 ml-2 font-sans">
              <span className="font-bold text-secondary">{match[1]}.</span>
              <span>{formatBoldText(match[2])}</span>
            </div>
          );
        }
      } else {
        content = <p className="font-sans min-h-[4px]">{formatBoldText(line)}</p>;
      }

      return (
        <div key={idx} className="my-1 text-xs md:text-sm leading-relaxed">
          {content}
        </div>
      );
    });
  };

  // Helper to parse double asterisks for bolding
  const formatBoldText = (str: string): React.ReactNode => {
    const parts = str.split(/\*\*(.*?)\*\*/g);
    if (parts.length === 1) return str;
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-extrabold text-primary">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
      ></div>

      {/* Slide-out Sidebar Drawer */}
      <aside className="relative w-full max-w-md bg-white border-l border-outline-variant h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-250">
        
        {/* Panel Header */}
        <div className="p-4 border-b border-outline-variant/50 flex items-center justify-between bg-primary text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-secondary text-sm font-bold pulse-soft">auto_awesome</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm leading-tight">CEC Portal Assistant</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-[10px] text-primary-fixed-dim font-medium uppercase tracking-wide">
                  Online Grounded AI
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Assistant"
          >
            <span className="material-symbols-outlined text-lg block">close</span>
          </button>
        </div>

        {/* Panel Chat Logs Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-surface-container-low/40">
          
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-10 px-4 h-full">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-4 shadow-xs">
                <span className="material-symbols-outlined text-3xl pulse-soft text-secondary">bolt</span>
              </div>
              <h4 className="font-headline font-extrabold text-base text-primary mb-1">
                Intelligent Portal Helper
              </h4>
              <p className="text-xs text-outline font-medium max-w-xs leading-relaxed mb-6">
                Ask me about CS302 syllabus, write formal leaves, resolve payment issues, or placement guides!
              </p>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
                {suggestionChips.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => onSendMessage(chip)}
                    className="p-3 text-left bg-white border border-outline-variant/30 hover:border-secondary/40 rounded-xl hover:bg-secondary/5 transition-all text-xs font-semibold text-on-surface cursor-pointer select-none shadow-3xs"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isAI = msg.role === "assistant";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${
                      isAI ? "self-start items-start" : "self-end items-end"
                    }`}
                  >
                    <span className="text-[9px] text-outline font-semibold mb-0.5 px-1.5">
                      {isAI ? "Assistant" : "Arjun Nair"} • {msg.timestamp}
                    </span>
                    <div
                      className={`p-3.5 rounded-2xl ${
                        isAI
                          ? "bg-secondary/10 text-on-secondary-container border border-secondary/20 rounded-tl-none font-sans"
                          : "bg-primary text-white rounded-tr-none font-sans"
                      }`}
                    >
                      {formatMessageText(msg.content)}
                    </div>
                  </div>
                );
              })}

              {/* Generating loading state */}
              {isGenerating && (
                <div className="flex flex-col max-w-[85%] self-start items-start">
                  <span className="text-[9px] text-outline font-semibold mb-0.5 px-1.5">
                    Assistant is thinking...
                  </span>
                  <div className="p-4 bg-secondary/10 border border-secondary/25 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-secondary animate-bounce delay-100"></span>
                    <span className="h-2 w-2 rounded-full bg-secondary animate-bounce delay-200"></span>
                    <span className="h-2 w-2 rounded-full bg-secondary animate-bounce delay-300"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </>
          )}

        </div>

        {/* Recommendation suggestions (hidden when list is empty) */}
        {messages.length > 0 && (
          <div className="px-4 py-2 bg-surface-container-low border-t border-outline-variant/20 flex gap-2 overflow-x-auto scrollbar-thin select-none">
            {suggestionChips.slice(0, 3).map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSendMessage(chip)}
                className="px-3 py-1 bg-white border border-outline-variant/30 hover:border-secondary/40 rounded-full text-[11px] font-bold text-outline hover:text-secondary hover:bg-secondary/5 transition-all whitespace-nowrap cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Panel Form Input */}
        <div className="p-4 border-t border-outline-variant/50 bg-white">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              required
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isGenerating}
              className="flex-grow bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-primary focus:outline-hidden text-on-surface disabled:opacity-50"
              placeholder={isGenerating ? "Please wait..." : "Ask your portal assistant..."}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isGenerating}
              className="bg-primary hover:bg-primary-container disabled:bg-outline-variant/40 disabled:cursor-not-allowed text-white px-5 rounded-xl text-xs font-black cursor-pointer transition-colors flex items-center justify-center select-none shadow-sm"
            >
              <span className="material-symbols-outlined font-black">send</span>
            </button>
          </form>
        </div>

      </aside>

    </div>
  );
}
