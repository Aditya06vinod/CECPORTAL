import { RequestItem, Course, HostelDetails, AcademicProgress } from "./types";

export const INITIAL_REQUESTS: RequestItem[] = [
  {
    id: "CEC-2204",
    type: "hostel",
    title: "Hostel Maintenance",
    desc: "Request #CEC-2204: Water leakage in Block B, Room 304.",
    status: "Resolved",
    date: "Closed yesterday at 4:30 PM",
    icon: "home_work",
    replies: [
      {
        id: "r1",
        sender: "student",
        senderName: "Arjun Nair",
        text: "Water is slowly leaking from the bathroom faucet and pooling on the tiles. Please repair it.",
        time: "Jul 15, 2026, 09:00 AM"
      },
      {
        id: "r2",
        sender: "admin",
        senderName: "Prof. K. Harikumar (Warden)",
        text: "Maintenance team has been dispatched to check Block B Room 340/304.",
        time: "Jul 15, 2026, 11:30 AM"
      },
      {
        id: "r3",
        sender: "admin",
        senderName: "Raju P. (Plumber)",
        text: "Faucet washer replaced. No more leaking. Leakage issue successfully resolved.",
        time: "Jul 16, 2026, 04:30 PM"
      }
    ]
  },
  {
    id: "CEC-2311",
    type: "course",
    title: "CS302 Registration",
    desc: "Elective Selection: Advanced Machine Learning.",
    status: "Pending",
    date: "Awaiting HOD Approval",
    icon: "app_registration",
    replies: [
      {
        id: "r4",
        sender: "student",
        senderName: "Arjun Nair",
        text: "Request to register for CS304 (Advanced Machine Learning) as an S6 professional elective.",
        time: "Jul 16, 2026, 10:15 AM"
      }
    ]
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    code: "CS302",
    name: "Data Analysis",
    credits: 4,
    instructor: "Dr. Mini Joseph",
    room: "Room 402",
    time: "10:30 AM - 12:00 PM",
    status: "Registered",
    description: "Fundamental statistical techniques, regression models, exploratory data analysis using Python and R languages, and predictive analytics tools."
  },
  {
    code: "CS304",
    name: "Advanced Machine Learning",
    credits: 3,
    instructor: "Prof. Thomas Sebastian",
    room: "Room 408",
    time: "01:30 PM - 03:00 PM",
    status: "Pending Approval",
    description: "In-depth look at neural networks, deep learning architectures, reinforcement learning models, and complex optimization algorithms."
  },
  {
    code: "CS306",
    name: "Computer Networks",
    credits: 4,
    instructor: "Dr. Deepa S.",
    room: "Room 401",
    time: "09:00 AM - 10:30 AM",
    status: "Registered",
    description: "OSI and TCP/IP protocol stacks, network routing, sliding window flow control protocols, IP addressing, socket programming, and security protocols."
  },
  {
    code: "CS308",
    name: "Software Engineering",
    credits: 3,
    instructor: "Prof. Anil Kumar K.",
    room: "Room 403",
    time: "11:00 AM - 12:30 PM",
    status: "Registered",
    description: "SDLC methodologies, Agile processes, UML modeling, testing strategies, software architecture patterns, and DevOps pipeline integration."
  },
  {
    code: "CS362",
    name: "Cloud Computing",
    credits: 3,
    instructor: "Prof. Bindu Mohan",
    room: "Lab 3",
    time: "02:00 PM - 03:30 PM",
    status: "Available",
    description: "Virtualization, infrastructure as a service (IaaS), cloud native microservices design, Kubernetes orchestration, and AWS/GCP deployments."
  },
  {
    code: "CS364",
    name: "Cryptography & Network Security",
    credits: 3,
    instructor: "Dr. Manoj Kumar",
    room: "Room 405",
    time: "03:30 PM - 05:00 PM",
    status: "Available",
    description: "Symmetric/Asymmetric encryption, RSA, AES, digital signatures, hashing algorithms, network vulnerability scanning, and defense mechanisms."
  }
];

export const HOSTEL_DATA: HostelDetails = {
  block: "Block B",
  room: "304",
  warden: "Prof. K. Harikumar",
  roommates: ["Sidharth S.", "Rahul Krishna", "Nitin George"],
  messMenu: [
    { day: "Monday", breakfast: "Idli, Sambar, Tea", lunch: "Rice, Fish Curry, Thoran, Moru", dinner: "Chapati, Veg Kurma, Salad" },
    { day: "Tuesday", breakfast: "Appam, Egg Curry, Coffee", lunch: "Rice, Chicken Fry, Avial, Rasam", dinner: "Porotta, Veg Korma / Beef Fry" },
    { day: "Wednesday", breakfast: "Puttu, Kadala Curry, Tea", lunch: "Rice, Sambar, Cabbage Thoran, Curd", dinner: "Chapati, Egg Masala" },
    { day: "Thursday", breakfast: "Dosa, Coconut Chutney, Coffee", lunch: "Rice, Fish Fry, Erissery, Pulissery", dinner: "Vegetable Biryani, Raita" },
    { day: "Friday", breakfast: "Upma, Banana, Tea", lunch: "Malabar Chicken Biryani, Salad, Pickle", dinner: "Chapati, Green Peas Masala" },
    { day: "Saturday", breakfast: "Idli, Chutney, Tea", lunch: "Rice, Sambar, Beetroot Thoran", dinner: "Fried Rice, Gobi Manchurian" },
    { day: "Sunday", breakfast: "Poori, Potato Masala, Coffee", lunch: "Rice, Aviyal, Pulissery, Payasam", dinner: "Chapati, Chicken Curry" }
  ]
};

export const INITIAL_PROGRESS: AcademicProgress = {
  attendance: 75,
  assignments: 92,
  syllabus: 60,
  feesPending: 2400,
  totalClasses: 80,
  attendedClasses: 60
};
