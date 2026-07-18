import React, { useState } from "react";

import { User } from "../types";

interface HeaderProps {
  onSearch: (query: string) => void;
  onAskAI: () => void;
  onToggleMobileMenu: () => void;
  unreadCount: number;
  currentUser: User;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Header({
  onSearch,
  onAskAI,
  onToggleMobileMenu,
  unreadCount,
  currentUser,
  darkMode,
  onToggleDarkMode
}: HeaderProps) {
  const [searchVal, setSearchVal] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState([
    { id: 1, text: "Hostel Maintenance Request #CEC-2204 is marked as Resolved.", read: false, time: "Yesterday" },
    { id: 2, text: "CS302 Elective approval is pending at Department HOD.", read: false, time: "2 days ago" },
    { id: 3, text: "New assignment uploaded in CS302: Data Analysis.", read: true, time: "3 days ago" }
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onSearch(searchVal);
      setSearchVal("");
    }
  };

  const markAllRead = () => {
    setNotifs(notifs.map(n => ({ ...n, read: true })));
  };

  const activeNotifs = notifs.filter(n => !n.read).length;

  return (
    <header className="flex justify-between items-center w-full px-6 md:px-10 h-16 sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-outline-variant/40">
      
      {/* Search Input & Mobile Toggle */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        {/* Mobile menu burger */}
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 rounded-lg text-on-surface-variant hover:bg-surface-container md:hidden cursor-pointer"
          title="Toggle Menu"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <form onSubmit={handleSearchSubmit} className="relative flex-1 hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="bg-surface-container-low border border-outline-variant/30 rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-hidden w-64 md:w-80 transition-all text-on-surface"
            placeholder="Search syllabus, leave forms, guides..."
          />
        </form>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4 md:gap-6">
        <div className="flex items-center gap-2">
          {/* Notifications Icon with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              {activeNotifs > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-error ring-2 ring-white"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotif && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)}></div>
                <div className="absolute right-0 mt-2 w-80 bg-white border border-outline-variant rounded-2xl shadow-lg py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-outline-variant/40">
                    <h4 className="font-bold text-sm text-primary">Notifications</h4>
                    {activeNotifs > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-secondary hover:underline font-bold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto pt-1">
                    {notifs.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 hover:bg-surface-container-low transition-colors border-b border-outline-variant/20 last:border-0 ${
                          !n.read ? "bg-primary/5" : ""
                        }`}
                      >
                        <p className={`text-xs text-on-surface ${!n.read ? "font-medium" : ""}`}>
                          {n.text}
                        </p>
                        <span className="text-[10px] text-outline mt-1 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors cursor-pointer flex items-center justify-center"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <span className="material-symbols-outlined text-xl">
              {darkMode ? "light_mode" : "dark_mode"}
            </span>
          </button>

          {/* Quick Help Link */}
          <button
            onClick={onAskAI}
            className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors cursor-pointer"
            title="Help Support"
          >
            <span className="material-symbols-outlined text-xl">help</span>
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/60">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-on-surface truncate max-w-[140px]">{currentUser.name}</p>
            <p className="text-[11px] text-outline font-medium capitalize">
              {currentUser.role === "admin" ? "Administrative Staff" : currentUser.idNumber || "Student Portal"}
            </p>
          </div>
          {currentUser.name === "Arjun Nair" ? (
            <img
              className="w-10 h-10 rounded-full border-2 border-primary-fixed shadow-xs object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuABKkrh0NxCtWLkU0ScOhamnklQtvIpfNzlYJf9tMuc5tOFKeZY5U70UTNxng-qLaD-6jIEfnik-5UasEjrrkYNBKIaPGSws5BSjTYW8JzJ_Zlp5phKXbzl_Y6v0IWPQhJ83em25jwVBq5vI8j2Y5MyFkVtEXASpaovQKF8R9rOROxaTJ9hgdfo87fycjshTDeqOcXncEhuaRVTzsztqsun63JhhOXRP9cSFEvTy_PhxhDCU44Sfyqy"
              alt="Arjun Nair"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-primary-fixed bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs select-none">
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
