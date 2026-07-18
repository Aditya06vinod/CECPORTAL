import React, { useState } from "react";
import { HostelDetails } from "../types";

interface HostelViewProps {
  hostelData: HostelDetails;
  onSubmitLeaveRequest: (title: string, desc: string) => void;
}

export default function HostelView({ hostelData, onSubmitLeaveRequest }: HostelViewProps) {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayIndex = new Date().getDay();
  const currentDayName = daysOfWeek[currentDayIndex];

  const [selectedDay, setSelectedDay] = useState<string>(currentDayName);
  
  // Quick Leave form state
  const [leaveReason, setLeaveReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [parentApproval, setParentApproval] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleQuickLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (leaveReason && startDate && endDate) {
      const savedUserStr = localStorage.getItem("cec_current_user");
      const currentUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      const name = currentUser?.name || "Student";
      const room = currentUser?.roomNumber || "304";

      const title = `Hostel Leave: ${name} (${startDate} to ${endDate})`;
      const desc = `Formal leave request from ${startDate} to ${endDate} for Hostel Block B Room ${room}. Reason: ${leaveReason}. Parent confirmation status: ${
        parentApproval ? "Emailed/Approved" : "Pending contact details"
      }.`;
      onSubmitLeaveRequest(title, desc);
      setLeaveReason("");
      setStartDate("");
      setEndDate("");
      setParentApproval(false);
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 5000);
    }
  };

  const selectedMessMenu = hostelData.messMenu.find((m) => m.day === selectedDay) || hostelData.messMenu[1];

  const roommatesStatus = [
    { name: "Sidharth S.", status: "In Room", color: "bg-secondary" },
    { name: "Rahul Krishna", status: "In Class (CS302)", color: "bg-primary" },
    { name: "Nitin George", status: "Home / Out of Campus", color: "bg-amber-500" }
  ];

  return (
    <div className="grid grid-cols-12 gap-6 animate-in fade-in duration-300">
      
      {/* Room Details Card */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
        <div className="bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-xs soft-shadow">
          <h3 className="font-headline font-bold text-lg text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">home_work</span>
            Room Information
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl">
              <span className="text-xs text-outline font-bold uppercase">Accommodation</span>
              <span className="text-sm font-black text-primary">
                {hostelData.block}, Room {hostelData.room}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl">
              <span className="text-xs text-outline font-bold uppercase">Hostel Warden</span>
              <span className="text-sm font-bold text-on-surface">
                {hostelData.warden}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-2">Roommates</h4>
              <div className="space-y-2">
                {roommatesStatus.map((rm, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 hover:bg-surface-container-low/50 rounded-lg transition-colors border border-outline-variant/10">
                    <span className="text-xs font-medium text-on-surface">{rm.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${rm.color}`}></span>
                      <span className="text-[10px] text-outline font-semibold">{rm.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contacts info */}
        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6">
          <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-2">Emergency Contacts</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
            For urgent hostel assistance, water grid shutdown, or medical support, reach out to:
          </p>
          <div className="space-y-1 text-xs">
            <p className="font-bold text-primary">📞 Main Office: <span className="font-mono">+91 479 2422240</span></p>
            <p className="font-bold text-primary">📞 Block B Caretaker: <span className="font-mono">+91 944 6301304</span></p>
          </div>
        </div>
      </div>

      {/* Mess Menu & Planner */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
        
        {/* Weekly Mess Planner Card */}
        <div className="bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-xs soft-shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h3 className="font-headline font-bold text-lg text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">restaurant</span>
                Hostel Mess Menu
              </h3>
              <p className="text-xs text-outline">Click on any day to inspect breakfast, lunch, and dinner options.</p>
            </div>
            
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg text-xs font-semibold">
              <span className="px-2.5 py-0.5 bg-secondary text-white rounded font-bold text-[10px] uppercase">
                Today
              </span>
              <span className="text-on-surface-variant pr-1.5 pl-0.5 font-sans font-bold">
                {currentDayName}
              </span>
            </div>
          </div>

          {/* Daily tab selector */}
          <div className="flex overflow-x-auto gap-1 pb-3 mb-4 border-b border-outline-variant/30 scrollbar-thin">
            {daysOfWeek.map((day) => {
              const isToday = day === currentDayName;
              const isSelected = day === selectedDay;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                    isSelected
                      ? "bg-primary text-white shadow-xs"
                      : isToday
                      ? "bg-secondary/15 text-secondary border border-secondary/20 hover:bg-secondary/20"
                      : "text-outline hover:bg-surface-container-low"
                  }`}
                >
                  {day.slice(0, 3)}
                  {isToday && " (Today)"}
                </button>
              );
            })}
          </div>

          {/* Menu Details Bento Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Breakfast */}
            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
              <div className="flex items-center gap-2 text-primary font-bold mb-3">
                <span className="material-symbols-outlined text-lg">wb_twilight</span>
                <span className="text-xs uppercase tracking-wider font-headline">Breakfast</span>
              </div>
              <p className="text-sm text-on-surface font-semibold">{selectedMessMenu.breakfast}</p>
              <span className="text-[10px] text-outline mt-2 block font-medium">Timings: 07:30 AM - 09:00 AM</span>
            </div>

            {/* Lunch */}
            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
              <div className="flex items-center gap-2 text-secondary font-bold mb-3">
                <span className="material-symbols-outlined text-lg">sunny</span>
                <span className="text-xs uppercase tracking-wider font-headline">Lunch</span>
              </div>
              <p className="text-sm text-on-surface font-semibold">{selectedMessMenu.lunch}</p>
              <span className="text-[10px] text-outline mt-2 block font-medium">Timings: 12:30 PM - 02:00 PM</span>
            </div>

            {/* Dinner */}
            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
              <div className="flex items-center gap-2 text-primary-container font-bold mb-3">
                <span className="material-symbols-outlined text-lg">dark_mode</span>
                <span className="text-xs uppercase tracking-wider font-headline">Dinner</span>
              </div>
              <p className="text-sm text-on-surface font-semibold">{selectedMessMenu.dinner}</p>
              <span className="text-[10px] text-outline mt-2 block font-medium">Timings: 07:30 PM - 09:00 PM</span>
            </div>

          </div>
        </div>

        {/* Leave application form */}
        <div className="bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-xs soft-shadow">
          <h3 className="font-headline font-bold text-lg text-primary mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined">directions_walk</span>
            Quick Leave Request Form
          </h3>
          <p className="text-xs text-outline mb-4">
            Required 24h prior to exit. Warden approval will be posted in your request list.
          </p>

          {formSuccess && (
            <div className="mb-4 p-3.5 bg-secondary-container/15 border border-secondary/30 rounded-xl text-xs text-on-secondary-container font-semibold animate-in fade-in">
              🚀 Leave Request submitted! You can track approval in the <strong>My Requests</strong> tab.
            </div>
          )}

          <form onSubmit={handleQuickLeaveSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary focus:outline-hidden text-on-surface"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary focus:outline-hidden text-on-surface"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                Reason for Leave
              </label>
              <input
                type="text"
                required
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary focus:outline-hidden text-on-surface"
                placeholder="e.g. Traveling home for family function / Medical checkup"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="parentApproval"
                checked={parentApproval}
                onChange={(e) => setParentApproval(e.target.checked)}
                className="rounded border-outline-variant/50 text-primary focus:ring-primary h-4 w-4"
              />
              <label htmlFor="parentApproval" className="text-xs text-on-surface-variant font-medium select-none cursor-pointer">
                Parent / Local Guardian has been notified and sent confirmation
              </label>
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 text-xs font-black rounded-lg cursor-pointer shadow-sm select-none"
            >
              Submit Leave Request
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
