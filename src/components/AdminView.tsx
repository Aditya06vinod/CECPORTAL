import React from "react";
import { RequestItem } from "../types";

interface AdminViewProps {
  requests: RequestItem[];
  onUpdateRequestStatus: (reqId: string, status: "Resolved" | "Pending" | "Rejected", adminNote?: string) => void;
  onDeleteRequest: (reqId: string) => void;
}

export default function AdminView({ requests, onUpdateRequestStatus, onDeleteRequest }: AdminViewProps) {
  
  const pendingRequests = requests.filter((r) => r.status === "Pending");
  const resolvedRequests = requests.filter((r) => r.status === "Resolved");
  const rejectedRequests = requests.filter((r) => r.status === "Rejected");

  const getCategoryBadge = (type: string) => {
    switch (type) {
      case "hostel":
        return "bg-amber-100 text-amber-800";
      case "course":
        return "bg-blue-100 text-blue-800";
      case "leave":
        return "bg-purple-100 text-purple-800";
      case "fees":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      
      {/* Simulation Info Header */}
      <div className="bg-primary text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <span className="text-[10px] uppercase bg-white/20 px-2 py-0.5 rounded font-black tracking-widest text-primary-fixed">
            Administrative Simulation
          </span>
          <h2 className="font-headline font-black text-2xl mt-1.5">CEC Portal Admin Panel</h2>
          <p className="text-xs text-primary-fixed-dim/90 font-light mt-1">
            Logged in as <strong>Prof. Thomas Sebastian (HOD / Warden)</strong>. You can clear, approve, or reject active student requests.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] text-primary-fixed-dim font-bold block uppercase tracking-wide">Pending</span>
            <span className="text-xl font-extrabold">{pendingRequests.length}</span>
          </div>
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] text-primary-fixed-dim font-bold block uppercase tracking-wide">Resolved</span>
            <span className="text-xl font-extrabold">{resolvedRequests.length}</span>
          </div>
        </div>
      </div>

      {/* Requests Review Board */}
      <div className="bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-xs soft-shadow">
        <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
          Incoming Student Petitions
        </h3>
        <p className="text-xs text-outline mb-6">
          Approve or reject elective enrollments, hostel repair clearances, and late-entry approvals below.
        </p>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-12 bg-surface-container-low/30 border border-dashed border-outline-variant rounded-2xl">
            <span className="material-symbols-outlined text-secondary text-4xl block mb-2 pulse-soft">check_circle</span>
            <h4 className="font-bold text-sm text-on-surface">All requests fully processed!</h4>
            <p className="text-xs text-outline font-semibold mt-1">
              Switch back to the Student profile or create a new request in the <strong>My Requests</strong> tab.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 bg-surface-container-low/50 border border-outline-variant/20 hover:border-outline-variant/60 rounded-xl transition-all flex flex-col md:flex-row justify-between gap-4 items-start md:items-center"
              >
                <div className="space-y-1.5 flex-1 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-primary font-mono bg-primary/5 px-2 py-0.5 rounded">
                      {req.id}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide ${getCategoryBadge(req.type)}`}>
                      {req.type}
                    </span>
                    <span className="text-xs text-outline font-medium">{req.date}</span>
                  </div>
                  
                  <h4 className="font-headline font-bold text-sm text-on-surface">
                    {req.title}
                  </h4>
                  
                  <p className="text-xs text-on-surface-variant leading-relaxed font-sans">
                    {req.desc}
                  </p>
                </div>

                {/* Direct Admin Actions */}
                <div className="flex gap-2 w-full md:w-auto items-center">
                  <button
                    onClick={() =>
                      onUpdateRequestStatus(
                        req.id,
                        "Resolved",
                        `Request approved and resolved by Prof. Thomas Sebastian. System registries have been updated.`
                      )
                    }
                    className="flex-1 md:flex-none bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg text-xs font-black cursor-pointer shadow-sm select-none"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      onUpdateRequestStatus(
                        req.id,
                        "Rejected",
                        `Petition declined. Please coordinate directly with your class HOD or counselor during administrative hours.`
                      )
                    }
                    className="flex-1 md:flex-none bg-error hover:bg-error/90 text-white px-4 py-2 rounded-lg text-xs font-black cursor-pointer shadow-sm select-none"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => onDeleteRequest(req.id)}
                    className="p-2 border border-error/20 hover:border-error bg-error/5 hover:bg-error/10 rounded-lg text-error cursor-pointer flex items-center justify-center transition-colors"
                    title="Permanently Delete Request"
                  >
                    <span className="material-symbols-outlined text-sm block">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historic records for audit trail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Approved logs */}
        <div className="bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-xs">
          <h4 className="font-headline font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">verified</span>
            Resolved Archive ({resolvedRequests.length})
          </h4>
          
          <div className="space-y-2.5 max-h-[250px] overflow-y-auto">
            {resolvedRequests.length === 0 ? (
              <p className="text-xs text-outline font-medium italic">No historical approvals yet.</p>
            ) : (
              resolvedRequests.map((r) => (
                <div key={r.id} className="p-3 bg-secondary/5 rounded-xl border border-secondary/10 flex justify-between items-center text-xs gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-on-surface truncate">{r.title}</p>
                    <span className="text-[10px] text-outline">{r.id} • Approved</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="material-symbols-outlined text-secondary font-bold text-lg">check</span>
                    <button
                      onClick={() => onDeleteRequest(r.id)}
                      className="p-1.5 rounded text-error hover:bg-error/15 cursor-pointer transition-colors"
                      title="Delete request permanently"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rejected logs */}
        <div className="bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-xs">
          <h4 className="font-headline font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-error">cancel</span>
            Declined Archive ({rejectedRequests.length})
          </h4>

          <div className="space-y-2.5 max-h-[250px] overflow-y-auto">
            {rejectedRequests.length === 0 ? (
              <p className="text-xs text-outline font-medium italic">No historical rejections yet.</p>
            ) : (
              rejectedRequests.map((r) => (
                <div key={r.id} className="p-3 bg-error/5 rounded-xl border border-error/10 flex justify-between items-center text-xs gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-on-surface truncate">{r.title}</p>
                    <span className="text-[10px] text-outline">{r.id} • Declined</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="material-symbols-outlined text-error font-bold text-lg">close</span>
                    <button
                      onClick={() => onDeleteRequest(r.id)}
                      className="p-1.5 rounded text-error hover:bg-error/15 cursor-pointer transition-colors"
                      title="Delete request permanently"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
