import React, { useState } from "react";
import { Course } from "../types";

interface CourseRegViewProps {
  courses: Course[];
  onSubmitCourseRequest: (courseCode: string, courseName: string) => void;
}

export default function CourseRegView({ courses, onSubmitCourseRequest }: CourseRegViewProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegisterElective = (course: Course) => {
    onSubmitCourseRequest(course.code, course.name);
    setSuccessMsg(`Requested registration for ${course.code}: ${course.name}. Tracking approval in requests tab.`);
    setTimeout(() => setSuccessMsg(""), 6000);
    setSelectedCourse(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Registered":
        return "bg-secondary/15 text-secondary border border-secondary/20";
      case "Pending Approval":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "Available":
        return "bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 cursor-pointer";
      default:
        return "bg-slate-100 text-slate-800 border border-slate-200";
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 animate-in fade-in duration-300">
      
      {/* Main Course Listing */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
        
        {/* Core Registered Classes */}
        <div className="bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-xs soft-shadow">
          <div className="mb-4">
            <h3 className="font-headline font-bold text-lg text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">menu_book</span>
              Registered Core Subjects (S6)
            </h3>
            <p className="text-xs text-outline">These core mandatory courses have been pre-registered for you.</p>
          </div>

          {successMsg && (
            <div className="mb-4 p-3.5 bg-secondary-container/15 border border-secondary/30 rounded-xl text-xs text-on-secondary-container font-semibold animate-in fade-in">
              🚀 {successMsg}
            </div>
          )}

          <div className="space-y-4">
            {courses
              .filter((c) => c.status === "Registered")
              .map((course) => (
                <div
                  key={course.code}
                  onClick={() => setSelectedCourse(course)}
                  className="p-4 bg-surface-container-low/50 hover:bg-surface-container-low border border-outline-variant/15 hover:border-outline-variant/60 rounded-xl transition-all cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-primary font-mono bg-primary/5 px-2 py-0.5 rounded">
                        {course.code}
                      </span>
                      <span className="text-xs text-outline font-semibold">Credits: {course.credits}</span>
                    </div>
                    <h4 className="font-headline font-bold text-sm text-on-surface mt-1.5">
                      {course.name}
                    </h4>
                    <p className="text-[11px] text-outline mt-1 font-medium">
                      Instructor: {course.instructor} • Room: {course.room}
                    </p>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 bg-secondary/15 text-secondary border border-secondary/20 rounded-full">
                    Active Registered
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Electives Selector */}
        <div className="bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-xs soft-shadow">
          <div className="mb-4">
            <h3 className="font-headline font-bold text-lg text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">app_registration</span>
              Professional Electives (S6)
            </h3>
            <p className="text-xs text-outline">Please apply for your preferred elective. Registrations require HOD clearance.</p>
          </div>

          <div className="space-y-4">
            {courses
              .filter((c) => c.status !== "Registered")
              .map((course) => (
                <div
                  key={course.code}
                  onClick={() => setSelectedCourse(course)}
                  className="p-4 bg-white hover:bg-surface-container-low/30 border border-outline-variant/20 rounded-xl transition-all cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-outline font-mono bg-outline-variant/10 px-2 py-0.5 rounded">
                        {course.code}
                      </span>
                      <span className="text-xs text-outline font-semibold">Credits: {course.credits}</span>
                    </div>
                    <h4 className="font-headline font-bold text-sm text-on-surface mt-1.5">
                      {course.name}
                    </h4>
                    <p className="text-[11px] text-outline mt-1 font-medium">
                      Room: {course.room} • {course.time}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider ${getStatusBadge(course.status)}`}>
                      {course.status}
                    </span>
                    {course.status === "Available" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegisterElective(course);
                        }}
                        className="bg-primary hover:bg-primary-container text-white px-3 py-1 rounded-md text-xs font-bold cursor-pointer transition-colors"
                      >
                        Register
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

      </div>

      {/* Side details panel or active description card */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
        
        {/* Course Details Card */}
        <div className="bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-xs soft-shadow">
          <h3 className="font-headline font-bold text-base text-primary mb-3">
            Course Overview
          </h3>
          
          {selectedCourse ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-black text-primary bg-primary/5 px-2 py-0.5 rounded">
                    {selectedCourse.code}
                  </span>
                  <h4 className="font-headline font-bold text-sm text-on-surface mt-2">
                    {selectedCourse.name}
                  </h4>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusBadge(selectedCourse.status)}`}>
                  {selectedCourse.status}
                </span>
              </div>

              <div className="text-xs space-y-2 border-y border-outline-variant/10 py-3">
                <p className="text-on-surface-variant leading-relaxed">
                  {selectedCourse.description}
                </p>
                <p className="text-outline">
                  <strong>Instructor:</strong> {selectedCourse.instructor}
                </p>
                <p className="text-outline">
                  <strong>Room Assigned:</strong> {selectedCourse.room}
                </p>
                <p className="text-outline">
                  <strong>Timings:</strong> {selectedCourse.time}
                </p>
              </div>

              {selectedCourse.status === "Available" ? (
                <button
                  onClick={() => handleRegisterElective(selectedCourse)}
                  className="w-full bg-primary hover:bg-primary-container text-white py-2 rounded-xl text-xs font-bold cursor-pointer transition-all uppercase tracking-wide select-none"
                >
                  Register Elective
                </button>
              ) : (
                <div className="text-center p-2 bg-slate-50 rounded-xl text-outline text-[11px] font-bold">
                  {selectedCourse.status === "Registered" ? "Already registered" : "Registration pending review"}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-outline text-3xl block mb-2">menu_book</span>
              <p className="text-xs text-outline font-semibold">Select a course to inspect description and schedule details.</p>
            </div>
          )}
        </div>

        {/* CGPU notice */}
        <div className="bg-secondary/5 border border-secondary/15 rounded-2xl p-6">
          <h4 className="text-xs font-black text-secondary uppercase tracking-widest mb-2">Registration Notes</h4>
          <ul className="text-[11px] text-on-surface-variant space-y-2 leading-relaxed font-medium">
            <li>• Maximum total credits for Semester 6 is capped at 22 credits.</li>
            <li>• Professional Electives can be changed within 7 days of course commencement.</li>
            <li>• Auditing courses requires special permission from Dr. Mini Joseph (S6 Counselor).</li>
          </ul>
        </div>

      </div>

    </div>
  );
}
