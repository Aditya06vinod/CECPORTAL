import React, { useState } from "react";
import { RequestItem, Reply } from "../types";

interface RequestsViewProps {
  requests: RequestItem[];
  selectedRequestId: string | null;
  onSelectRequest: (id: string | null) => void;
  onSubmitRequest: (type: "hostel" | "course" | "leave" | "fees", title: string, desc: string) => void;
  onSubmitReply: (reqId: string, text: string) => void;
  onAskAISuggestion: (reqTitle: string, reqDesc: string) => void;
}

export default function RequestsView({
  requests,
  selectedRequestId,
  onSelectRequest,
  onSubmitRequest,
  onSubmitReply,
  onAskAISuggestion
}: RequestsViewProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // New Request Form State
  const [showNewModal, setShowNewModal] = useState(false);
  const [newType, setNewType] = useState<"hostel" | "course" | "leave" | "fees">("hostel");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Reply Input State
  const [replyText, setReplyText] = useState("");

  const handleCreateRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && newDesc.trim()) {
      onSubmitRequest(newType, newTitle, newDesc);
      setNewTitle("");
      setNewDesc("");
      setShowNewModal(false);
    }
  };

  const handleSendReply = (e: React.FormEvent, reqId: string) => {
    e.preventDefault();
    if (replyText.trim()) {
      onSubmitReply(reqId, replyText);
      setReplyText("");
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesType = filterType === "all" || r.type === filterType;
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const selectedRequest = requests.find((r) => r.id === selectedRequestId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-secondary/10 text-secondary border border-secondary/20";
      case "Pending":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "Rejected":
        return "bg-error/10 text-error border border-error/20";
      default:
        return "bg-slate-100 text-slate-800 border border-slate-200";
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 animate-in fade-in duration-300">
      
      {/* Sidebar/Main split layout depending on selection */}
      <div className={`col-span-12 ${selectedRequest ? "lg:col-span-5" : "col-span-12"} flex flex-col gap-4`}>
        {/* Toolbar Card */}
        <div className="bg-white border border-outline-variant/50 rounded-2xl p-4 md:p-6 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 bg-surface-container-low border border-outline-variant/30 text-xs font-bold rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary text-on-surface"
            >
              <option value="all">All Types</option>
              <option value="hostel">Hostel</option>
              <option value="course">Course</option>
              <option value="leave">Leaves</option>
              <option value="fees">Fees</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-surface-container-low border border-outline-variant/30 text-xs font-bold rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary text-on-surface"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="w-full sm:w-auto bg-primary hover:bg-primary-container text-white px-4 py-2 text-xs font-black rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shadow-sm select-none"
          >
            <span className="material-symbols-outlined text-sm font-black">add</span>
            Create Request
          </button>
        </div>

        {/* Requests List Card */}
        <div className="bg-white border border-outline-variant/50 rounded-2xl p-4 md:p-6 shadow-xs flex-grow overflow-y-auto max-h-[600px] flex flex-col gap-3">
          <div className="relative mb-2">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-surface-container-low border border-outline-variant/30 rounded-xl pl-9 pr-4 py-1.5 text-xs focus:ring-2 focus:ring-primary focus:outline-hidden w-full text-on-surface"
              placeholder="Search by ID, title, keyword..."
            />
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-outline text-4xl block mb-2">drafts</span>
              <p className="text-sm font-bold text-outline">No requests match filters</p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isSelected = req.id === selectedRequestId;
              return (
                <div
                  key={req.id}
                  onClick={() => onSelectRequest(req.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 relative ${
                    isSelected
                      ? "bg-primary/5 border-primary shadow-xs"
                      : "bg-surface-container-low/50 border-outline-variant/20 hover:border-outline-variant/80 hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-headline font-bold text-sm text-primary">{req.id}</span>
                        <span className="text-[10px] text-outline font-black bg-outline-variant/20 px-1.5 py-0.5 rounded tracking-wide uppercase">
                          {req.type}
                        </span>
                      </div>
                      <h4 className="font-headline font-bold text-sm text-on-surface mt-1">
                        {req.title}
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant line-clamp-1">{req.desc}</p>

                  <div className="flex justify-between items-center text-[10px] text-outline pt-2 border-t border-outline-variant/10">
                    <span className="font-semibold">{req.date}</span>
                    <span className="font-bold flex items-center gap-0.5 text-primary">
                      {req.replies.length} message{req.replies.length !== 1 && "s"}
                      <span className="material-symbols-outlined text-[12px] font-bold">chevron_right</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detailed Chat Split View */}
      {selectedRequest && (
        <div className="col-span-12 lg:col-span-7 bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-xs flex flex-col h-[600px] justify-between animate-in slide-in-from-right-4 duration-300">
          <div>
            {/* Header detail */}
            <div className="flex justify-between items-start pb-4 border-b border-outline-variant/40">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-headline font-extrabold text-lg text-primary">{selectedRequest.id}</span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <h3 className="font-headline font-bold text-base text-on-surface mt-1">
                  {selectedRequest.title}
                </h3>
              </div>
              <button
                onClick={() => onSelectRequest(null)}
                className="p-1.5 rounded-full text-outline hover:bg-surface-container-low transition-colors cursor-pointer"
                title="Close detail"
              >
                <span className="material-symbols-outlined text-lg block">close</span>
              </button>
            </div>

            {/* Scrollable Conversation */}
            <div className="flex-grow overflow-y-auto max-h-[350px] my-4 pr-1 flex flex-col gap-4">
              {selectedRequest.replies.map((reply) => {
                const isStudent = reply.sender === "student";
                const isAI = reply.sender === "ai";
                
                return (
                  <div
                    key={reply.id}
                    className={`flex flex-col max-w-[85%] ${
                      isStudent ? "self-end items-end" : "self-start items-start"
                    }`}
                  >
                    <span className="text-[10px] text-outline font-semibold mb-1 px-1">
                      {reply.senderName} • {reply.time}
                    </span>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isStudent
                          ? "bg-primary text-white rounded-tr-none"
                          : isAI
                          ? "bg-secondary/10 text-on-secondary-container border border-secondary/20 rounded-tl-none"
                          : "bg-surface-container text-on-surface rounded-tl-none border border-outline-variant/30"
                      }`}
                    >
                      {reply.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Action suggestions or send block */}
          <div className="border-t border-outline-variant/40 pt-4 bg-white">
            
            {/* AI suggest help */}
            <div className="mb-3 flex items-center justify-between p-2.5 bg-secondary-container/10 border border-secondary/20 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary pulse-soft text-sm">auto_awesome</span>
                <span className="text-[11px] font-bold text-on-secondary-container">
                  Let AI draft a response or suggest a resolution.
                </span>
              </div>
              <button
                onClick={() => onAskAISuggestion(selectedRequest.title, selectedRequest.desc)}
                className="text-[10px] font-bold bg-secondary text-white px-2.5 py-1 rounded-md hover:bg-secondary/90 transition-colors cursor-pointer select-none"
              >
                Ask AI Assistant
              </button>
            </div>

            {/* Form */}
            <form onSubmit={(e) => handleSendReply(e, selectedRequest.id)} className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-grow bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-hidden text-on-surface"
                placeholder="Type your reply here..."
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="bg-primary hover:bg-primary-container disabled:bg-outline-variant/40 disabled:cursor-not-allowed text-white px-5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Reply
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Request Modal Popup */}
      {showNewModal && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity" onClick={() => setShowNewModal(false)}></div>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white border border-outline-variant rounded-[1.5rem] shadow-xl p-6 z-50 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant/40">
              <h3 className="font-headline font-black text-lg text-primary">Create New Formal Request</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-outline hover:text-on-surface cursor-pointer p-1 rounded-full hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined block">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateRequestSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1.5">
                  Request Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "hostel", label: "Hostel", icon: "home_work" },
                    { id: "course", label: "Electives", icon: "app_registration" },
                    { id: "leave", label: "Leaves", icon: "directions_walk" },
                    { id: "fees", label: "Fees / Fin", icon: "account_balance_wallet" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewType(t.id as any)}
                      className={`p-2.5 border rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                        newType === t.id
                          ? "bg-primary/5 border-primary text-primary font-bold shadow-xs scale-98"
                          : "border-outline-variant/30 text-on-surface hover:bg-surface-container-low"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{t.icon}</span>
                      <span className="text-[10px] tracking-tight">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1">
                  Request Title / Subject
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-hidden text-on-surface"
                  placeholder="e.g. Leave Application for coming weekend / Lab router issue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1">
                  Detailed Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-hidden text-on-surface"
                  placeholder="Provide precise details, dates, rooms, and reasoning."
                />
              </div>

              <div className="pt-3 border-t border-outline-variant/40 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-outline-variant/40 rounded-lg text-xs font-bold text-outline hover:bg-surface-container-low cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-container text-white text-xs font-black rounded-lg cursor-pointer shadow-sm select-none"
                >
                  Submit Form
                </button>
              </div>
            </form>
          </div>
        </>
      )}

    </div>
  );
}
