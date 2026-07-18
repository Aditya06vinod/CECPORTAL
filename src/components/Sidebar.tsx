import React from "react";
import { User } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAskAI: () => void;
  currentUser: User;
  onLogout: () => void;
  unreadCount: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onAskAI,
  currentUser,
  onLogout,
  unreadCount
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "requests", label: "Requests", icon: "list_alt", badge: unreadCount },
    ...(currentUser.role === "student" ? [
      { id: "hostel", label: "Hostel", icon: "home_work" },
      { id: "course_reg", label: "Course Registration", icon: "app_registration" }
    ] : []),
    ...(currentUser.role === "admin" ? [
      { id: "admin", label: "Admin View", icon: "admin_panel_settings", info: "Clear/approve student requests" }
    ] : [])
  ];

  return (
    <nav className="fixed left-0 top-0 h-full flex flex-col p-4 z-40 border-r border-outline-variant bg-surface-container-low w-64 hidden md:flex">
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-start px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-white text-2xl font-bold">school</span>
          </div>
          <div>
            <h1 className="font-headline text-lg font-black text-primary leading-tight">CEC Portal</h1>
            <p className="text-[10px] uppercase tracking-widest text-outline font-semibold">
              College of Engineering Chengannur
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-1.5 flex-grow">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              title={item.info}
              className={`flex items-center justify-between w-full p-3 rounded-xl transition-all cursor-pointer text-left ${
                isActive
                  ? "bg-surface-container-high text-primary font-bold shadow-xs scale-[0.99]"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-xl ${isActive ? "text-primary" : "text-outline"}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              
              {/* Badge for notifications */}
              {item.badge && item.badge > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              ) : null}

              {item.id === "admin" && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold tracking-wider uppercase">
                  SIM
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Interactive AI Assistant Button */}
      <div className="px-1 mb-4">
        <button
          id="ask-ai-sidebar"
          onClick={onAskAI}
          className="w-full bg-secondary-container hover:brightness-95 active:scale-98 transition-all text-on-secondary-container p-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold cursor-pointer shadow-sm relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="material-symbols-outlined pulse-soft text-xl text-secondary">bolt</span>
          <span className="text-sm font-headline tracking-wide uppercase">Ask AI Assistant</span>
        </button>
      </div>

      {/* Footer Controls & User Display */}
      <div className="flex flex-col gap-2 border-t border-outline-variant pt-4">
        <div className="px-3 py-2.5 bg-surface-container-high rounded-xl flex flex-col gap-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-outline font-black uppercase tracking-wider">Session Profile</span>
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
              currentUser.role === "admin" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
            }`}>
              {currentUser.role}
            </span>
          </div>
          <p className="font-bold text-on-surface truncate">{currentUser.name}</p>
          {currentUser.idNumber && <p className="text-[10px] text-outline font-mono truncate">{currentUser.idNumber}</p>}
        </div>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors cursor-pointer ${
            activeTab === "settings"
              ? "bg-surface-container-high text-primary font-bold"
              : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          <span className="material-symbols-outlined text-outline">settings</span>
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-error-container/20 hover:text-error transition-colors rounded-lg cursor-pointer text-left w-full"
        >
          <span className="material-symbols-outlined text-error">logout</span>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}
