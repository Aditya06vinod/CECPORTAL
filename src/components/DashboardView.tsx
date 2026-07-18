import React, { useState } from "react";
import { RequestItem, AcademicProgress } from "../types";

interface DashboardViewProps {
  requests: RequestItem[];
  progress: AcademicProgress;
  onNavigateToTab: (tab: string) => void;
  onAskAIQuery: (query: string) => void;
  onSelectRequest: (reqId: string) => void;
  onPayFees: () => void;
}

export default function DashboardView({
  requests,
  progress,
  onNavigateToTab,
  onAskAIQuery,
  onSelectRequest,
  onPayFees
}: DashboardViewProps) {
  const [query, setQuery] = useState("");

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onAskAIQuery(query);
      setQuery("");
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-secondary text-on-secondary";
      case "Pending":
        return "bg-surface-container-highest text-on-surface-variant border border-outline-variant";
      case "Rejected":
        return "bg-error text-on-error";
      default:
        return "bg-surface-container text-on-surface";
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      
      {/* AI Hero Section (Chat-First Interface) */}
      <section className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-primary p-6 md:p-10 text-white soft-shadow">
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary-container via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-3xl">
          <h2 className="font-headline text-3xl md:text-[2.75rem] font-black mb-3 leading-tight tracking-tight">
            What can I help you with today?
          </h2>
          <p className="font-sans text-base md:text-lg text-primary-fixed-dim/90 mb-8 font-light">
            Ask anything — registration, hostel, grievance, mental health, placements.
          </p>

          <form onSubmit={handleHeroSubmit} className="relative ai-glow transition-all rounded-2xl md:rounded-3xl bg-white flex items-center p-1.5 md:p-2 shadow-md">
            <span className="material-symbols-outlined text-primary ml-3 font-semibold select-none">
              auto_awesome
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-grow bg-transparent border-0 focus:ring-0 focus:outline-hidden text-on-surface px-3 py-2 text-sm md:text-base font-sans placeholder-outline"
              placeholder="Type your query here..."
            />
            <button
              type="submit"
              className="bg-primary text-white hover:bg-primary-container active:scale-95 transition-all px-5 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm font-semibold font-headline cursor-pointer select-none"
            >
              Send Request
            </button>
          </form>

          {/* Quick Links */}
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-primary-fixed-dim/70 mr-2 py-1 font-medium">Quick Links:</span>
            {[
              "Course CS302 syllabus",
              "Hostel leave form",
              "Placement schedule"
            ].map((link, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onAskAIQuery(link)}
                className="px-4 py-1.5 rounded-full border border-primary-fixed-dim/20 text-primary-fixed-dim bg-white/5 hover:bg-white/15 hover:text-white transition-all cursor-pointer text-xs font-medium"
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Dashboard Section */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* My Requests Card */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-xs flex flex-col justify-between soft-shadow min-h-[350px]">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline text-xs text-outline uppercase tracking-wider font-bold">
                Active Requests
              </h3>
              <button
                onClick={() => onNavigateToTab("requests")}
                className="text-primary hover:text-primary-container font-headline text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                View all <span className="material-symbols-outlined text-[16px] font-bold">arrow_forward</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.slice(0, 2).map((req) => (
                <div
                  key={req.id}
                  onClick={() => {
                    onSelectRequest(req.id);
                    onNavigateToTab("requests");
                  }}
                  className="p-4 bg-surface-container-low hover:bg-surface-container rounded-xl border border-outline-variant/30 hover:border-primary/40 transition-all cursor-pointer group flex flex-col justify-between h-44"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className={`p-2 rounded-lg ${
                        req.status === "Resolved"
                          ? "bg-secondary/10 text-secondary"
                          : "bg-primary/10 text-primary"
                      }`}>
                        <span className="material-symbols-outlined text-lg block">{req.icon}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${getStatusStyle(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                    <h4 className="font-headline font-bold text-base text-on-surface mb-1 group-hover:text-primary transition-colors">
                      {req.title}
                    </h4>
                    <p className="text-xs text-on-surface-variant line-clamp-2">
                      {req.desc}
                    </p>
                  </div>

                  <div className="flex items-center text-outline text-[11px] gap-1.5 pt-2 border-t border-outline-variant/20">
                    <span className="material-symbols-outlined text-sm">
                      {req.status === "Resolved" ? "schedule" : "hourglass_empty"}
                    </span>
                    <span className="font-medium">{req.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-outline-variant/20 text-center">
            <p className="text-xs text-outline">
              Need to submit a new complaint or request? Use the{" "}
              <button
                onClick={() => onNavigateToTab("requests")}
                className="text-primary font-bold hover:underline"
              >
                My Requests
              </button>{" "}
              tab.
            </p>
          </div>
        </div>

        {/* Quick Stats Widget */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-high rounded-2xl p-6 soft-shadow flex-grow flex flex-col justify-between">
            <div>
              <h3 className="font-headline text-xs text-primary uppercase tracking-wider font-bold mb-6">
                Quick Stats
              </h3>
              
              <div className="space-y-4">
                {/* Stat 1 */}
                <div className="flex items-center gap-4 p-2.5 bg-white/40 hover:bg-white/75 rounded-xl transition-all">
                  <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-primary font-bold text-lg shadow-xs select-none">
                    {progress.assignments > 90 ? "03" : "01"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Pending Items</p>
                    <p className="text-[11px] text-on-surface-variant font-medium">
                      2 Assignments, 1 Lab Report
                    </p>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="flex items-center gap-4 p-2.5 bg-white/40 hover:bg-white/75 rounded-xl transition-all">
                  <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-error font-bold text-lg shadow-xs select-none">
                    12
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Upcoming Deadlines</p>
                    <p className="text-[11px] text-on-surface-variant font-medium">
                      Project submission in 48h
                    </p>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="flex items-center gap-4 p-2.5 bg-white/40 hover:bg-white/75 rounded-xl transition-all">
                  <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-secondary font-bold text-lg shadow-xs select-none">
                    8.4
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Current CGPA</p>
                    <p className="text-[11px] text-on-surface-variant font-medium">
                      Top 10% of S6 batch
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-primary/10">
              <div className="bg-primary/5 rounded-xl p-3.5 border border-primary/10">
                <p className="text-[10px] text-outline mb-1 uppercase font-black tracking-widest">
                  Today's Class
                </p>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm text-primary">CS302: Data Analysis</p>
                    <p className="text-xs text-on-surface-variant">10:30 AM - Room 402</p>
                  </div>
                  <button
                    onClick={() => onAskAIQuery("Tell me about CS302 syllabus and instructor")}
                    className="p-1 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
                    title="Ask AI about this class"
                  >
                    <span className="material-symbols-outlined text-sm block">auto_awesome</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Progress / Course View */}
        <div className="col-span-12 bg-white border border-outline-variant/50 rounded-2xl p-6 soft-shadow">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Academic Timeline
              </h3>
              <p className="text-xs text-outline font-medium">
                Tracking your S6 Computer Science journey at CEC
              </p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-surface-container-low border border-outline-variant/30 rounded-full text-xs font-semibold text-primary">
                Semester 6
              </span>
              <span className="px-3 py-1 bg-surface-container-low border border-outline-variant/30 rounded-full text-xs font-semibold text-outline">
                2023-2024
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Attendance Meter */}
            <div className="flex flex-col gap-2 p-3 bg-surface-container-low/50 rounded-xl hover:bg-surface-container-low transition-all">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-on-surface-variant">Attendance</span>
                <span className="text-primary">{progress.attendance}%</span>
              </div>
              <div className="h-2 w-full bg-outline-variant/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress.attendance}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-outline font-semibold">
                {progress.attendedClasses} of {progress.totalClasses} classes attended
              </p>
            </div>

            {/* Assignments Meter */}
            <div className="flex flex-col gap-2 p-3 bg-surface-container-low/50 rounded-xl hover:bg-surface-container-low transition-all">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-on-surface-variant">Assignments</span>
                <span className="text-secondary">{progress.assignments}%</span>
              </div>
              <div className="h-2 w-full bg-outline-variant/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-500"
                  style={{ width: `${progress.assignments}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-outline font-semibold">
                9 of 10 tasks submitted successfully
              </p>
            </div>

            {/* Syllabus Meter */}
            <div className="flex flex-col gap-2 p-3 bg-surface-container-low/50 rounded-xl hover:bg-surface-container-low transition-all">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-on-surface-variant">Syllabus Covered</span>
                <span className="text-primary-container">{progress.syllabus}%</span>
              </div>
              <div className="h-2 w-full bg-outline-variant/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-fixed-dim rounded-full transition-all duration-500"
                  style={{ width: `${progress.syllabus}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-outline font-semibold">
                Mid-term portions finished
              </p>
            </div>

            {/* Fees Meter */}
            <div className="flex flex-col gap-2 p-3 bg-surface-container-low/50 rounded-xl hover:bg-surface-container-low transition-all">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-on-surface-variant">Fees Pending</span>
                <span className={`${progress.feesPending > 0 ? "text-error" : "text-secondary"}`}>
                  {progress.feesPending > 0 ? `₹${progress.feesPending.toLocaleString()}` : "Fully Paid"}
                </span>
              </div>
              <div className="h-2 w-full bg-outline-variant/30 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progress.feesPending > 0 ? "bg-error" : "bg-secondary"
                  }`}
                  style={{ width: progress.feesPending > 0 ? "20%" : "100%" }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] text-outline font-semibold">Semester Exam Fee</span>
                {progress.feesPending > 0 ? (
                  <button
                    onClick={onPayFees}
                    className="text-[9px] px-2 py-0.5 bg-error text-white font-black uppercase rounded hover:bg-error/80 cursor-pointer select-none"
                  >
                    Pay Now
                  </button>
                ) : (
                  <span className="text-[9px] text-secondary font-black uppercase select-none">
                    Receipt Generated
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
