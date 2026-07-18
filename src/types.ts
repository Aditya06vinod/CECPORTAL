export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  idNumber?: string;
  roomNumber?: string;
}

export interface Reply {
  id: string;
  sender: "student" | "admin" | "ai";
  senderName: string;
  text: string;
  time: string;
}

export interface RequestItem {
  id: string;
  type: "hostel" | "course" | "leave" | "fees";
  title: string;
  desc: string;
  status: "Resolved" | "Pending" | "Rejected";
  date: string;
  icon: string;
  replies: Reply[];
}

export interface AcademicProgress {
  attendance: number;
  assignments: number;
  syllabus: number;
  feesPending: number;
  totalClasses: number;
  attendedClasses: number;
}

export interface Course {
  code: string;
  name: string;
  credits: number;
  instructor: string;
  room: string;
  time: string;
  status: "Registered" | "Pending Approval" | "Available";
  description: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface HostelDetails {
  block: string;
  room: string;
  warden: string;
  roommates: string[];
  messMenu: {
    day: string;
    breakfast: string;
    lunch: string;
    dinner: string;
  }[];
}
