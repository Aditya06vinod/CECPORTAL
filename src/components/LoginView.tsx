import React, { useState } from "react";
import { User } from "../types";

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function LoginView({ onLoginSuccess, darkMode, onToggleDarkMode }: LoginViewProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Sign up fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"student" | "admin">("student");
  const [regIdNumber, setRegIdNumber] = useState("");
  const [regRoomNumber, setRegRoomNumber] = useState("");
  
  // Feedback
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Read users from localStorage
    const savedUsersStr = localStorage.getItem("cec_users");
    const users: User[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];

    // Find user
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === loginEmail.toLowerCase()
    );

    if (!foundUser) {
      // Check default users
      if (loginEmail.toLowerCase() === "arjun@cec.ac.in" && loginPassword === "student") {
        const defaultStudent: User = {
          id: "usr-arjun",
          name: "Arjun Nair",
          email: "arjun@cec.ac.in",
          role: "student",
          idNumber: "CEC20CS042",
          roomNumber: "304"
        };
        onLoginSuccess(defaultStudent);
        return;
      } else if (loginEmail.toLowerCase() === "admin@cec.ac.in" && loginPassword === "admin") {
        const defaultAdmin: User = {
          id: "usr-admin",
          name: "Prof. Thomas Sebastian",
          email: "admin@cec.ac.in",
          role: "admin",
          idNumber: "FAC-CS001"
        };
        onLoginSuccess(defaultAdmin);
        return;
      }
      setErrorMsg("Invalid credentials or user does not exist. Try the quick login buttons!");
      return;
    }

    // In a real frontend-only demo, we'll match passwords (simulated as password = email + "123" or whatever, 
    // or we can allow any password for custom registered users to keep it simple, or match what they signed up with)
    // Let's check password from our custom local storage users (stored in password key)
    const storedPasswords = JSON.parse(localStorage.getItem("cec_user_passwords") || "{}");
    if (storedPasswords[foundUser.email.toLowerCase()] !== loginPassword) {
      setErrorMsg("Incorrect password. Please try again.");
      return;
    }

    onLoginSuccess(foundUser);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    const savedUsersStr = localStorage.getItem("cec_users");
    const users: User[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];

    // Check duplicates
    const emailLower = regEmail.toLowerCase();
    if (
      emailLower === "arjun@cec.ac.in" ||
      emailLower === "admin@cec.ac.in" ||
      users.some((u) => u.email.toLowerCase() === emailLower)
    ) {
      setErrorMsg("This email address is already registered.");
      return;
    }

    // Create user
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: regName,
      email: regEmail,
      role: regRole,
      idNumber: regIdNumber || undefined,
      roomNumber: regRole === "student" ? regRoomNumber || undefined : undefined
    };

    // Save user
    users.push(newUser);
    localStorage.setItem("cec_users", JSON.stringify(users));

    // Save password
    const storedPasswords = JSON.parse(localStorage.getItem("cec_user_passwords") || "{}");
    storedPasswords[emailLower] = regPassword;
    localStorage.setItem("cec_user_passwords", JSON.stringify(storedPasswords));

    setSuccessMsg("Registration successful! You can now log in using your credentials.");
    
    // Auto populate login and switch to login tab
    setLoginEmail(regEmail);
    setLoginPassword(regPassword);
    
    setTimeout(() => {
      setIsSignUp(false);
      setSuccessMsg("");
    }, 1500);
  };

  const loginAsDemo = (role: "student" | "admin") => {
    if (role === "student") {
      onLoginSuccess({
        id: "usr-arjun",
        name: "Arjun Nair",
        email: "arjun@cec.ac.in",
        role: "student",
        idNumber: "CEC20CS042",
        roomNumber: "304"
      });
    } else {
      onLoginSuccess({
        id: "usr-admin",
        name: "Prof. Thomas Sebastian",
        email: "admin@cec.ac.in",
        role: "admin",
        idNumber: "FAC-CS001"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 md:p-10 font-sans relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Floating Dark Mode Toggle */}
      <button
        type="button"
        onClick={onToggleDarkMode}
        className="absolute top-6 right-6 p-3 bg-surface-container border border-outline-variant/60 rounded-full shadow-md text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer z-50 flex items-center justify-center"
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        <span className="material-symbols-outlined text-xl">
          {darkMode ? "light_mode" : "dark_mode"}
        </span>
      </button>

      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/60 rounded-[2.5rem] shadow-xl p-8 md:p-10 relative z-10 transition-all duration-300">
        
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-sm mb-4">
            <span className="material-symbols-outlined text-white text-3xl font-bold">school</span>
          </div>
          <h1 className="font-headline text-2xl font-black text-primary leading-tight">CEC Student Portal</h1>
          <p className="text-[10px] uppercase tracking-widest text-outline font-semibold mt-1">
            College of Engineering Chengannur
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="flex bg-surface-container p-1 rounded-xl mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-2 rounded-lg cursor-pointer transition-all ${
              !isSignUp ? "bg-background text-primary shadow-xs" : "text-outline hover:text-on-surface"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-2 rounded-lg cursor-pointer transition-all ${
              isSignUp ? "bg-background text-primary shadow-xs" : "text-outline hover:text-on-surface"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Feedback messages */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-xl text-xs text-error font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-sm font-bold">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-secondary/10 border border-secondary/20 rounded-xl text-xs text-secondary font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Forms */}
        {!isSignUp ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-hidden text-on-surface"
                placeholder="e.g. arjun@cec.ac.in"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-hidden text-on-surface"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm select-none uppercase tracking-wider"
            >
              Log In to Portal
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUpSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary focus:outline-hidden text-on-surface"
                placeholder="e.g. Rahul Sharma"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary focus:outline-hidden text-on-surface"
                placeholder="e.g. rahul@cec.ac.in"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary focus:outline-hidden text-on-surface"
                placeholder="Choose a password"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                Your Role
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setRegRole("student")}
                  className={`py-1.5 border rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    regRole === "student"
                      ? "bg-primary/5 border-primary text-primary"
                      : "border-outline-variant/30 text-outline hover:bg-surface-container-low"
                  }`}
                >
                  🧑‍🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole("admin")}
                  className={`py-1.5 border rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    regRole === "admin"
                      ? "bg-primary/5 border-primary text-primary"
                      : "border-outline-variant/30 text-outline hover:bg-surface-container-low"
                  }`}
                >
                  💼 Admin / HOD
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                  ID Number (Optional)
                </label>
                <input
                  type="text"
                  value={regIdNumber}
                  onChange={(e) => setRegIdNumber(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary focus:outline-hidden text-on-surface"
                  placeholder={regRole === "student" ? "CEC20CS042" : "FAC-CS001"}
                />
              </div>

              {regRole === "student" && (
                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                    Room No. (Optional)
                  </label>
                  <input
                    type="text"
                    value={regRoomNumber}
                    onChange={(e) => setRegRoomNumber(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary focus:outline-hidden text-on-surface"
                    placeholder="e.g. 304"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-container text-white py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm select-none uppercase tracking-wider mt-2"
            >
              Sign Up Now
            </button>
          </form>
        )}

        {/* Demo Accounts Panel */}
        <div className="mt-8 pt-6 border-t border-outline-variant/40">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest text-center mb-3">
            Quick Sandbox Logins
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => loginAsDemo("student")}
              className="p-3 bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/30 rounded-2xl text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-primary mb-1">
                <span className="material-symbols-outlined text-base">school</span>
                <span className="text-[11px] font-black uppercase tracking-wide">Student</span>
              </div>
              <p className="text-[11px] font-bold text-on-surface leading-tight">Arjun Nair</p>
              <p className="text-[9px] text-outline font-medium">Click to log in</p>
            </button>

            <button
              type="button"
              onClick={() => loginAsDemo("admin")}
              className="p-3 bg-secondary/5 hover:bg-secondary/10 border border-secondary/10 hover:border-secondary/30 rounded-2xl text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-secondary mb-1">
                <span className="material-symbols-outlined text-base font-bold">admin_panel_settings</span>
                <span className="text-[11px] font-black uppercase tracking-wide">Admin</span>
              </div>
              <p className="text-[11px] font-bold text-on-surface leading-tight">Prof. Sebastian</p>
              <p className="text-[9px] text-outline font-medium">Click to log in</p>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
