import { useEffect, useRef, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { fetchPatientProfile } from "../services/patientApi";

const FILE_BASE_URL = "http://localhost:5002";

const navItems = [
  {
    path: "/patient/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
  },
  {
    path: "/patient/profile",
    label: "Profile",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5.121 17.804A9 9 0 1118.88 17.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    path: "/patient/find-doctors",
    label: "Find Doctors",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
  },
  {
    path: "/patient/appointments",
    label: "My Appointments",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    path: "/patient/medical-history",
    label: "Medical History",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    path: "/patient/prescriptions",
    label: "Prescriptions",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19.428 15.428a4 4 0 00-5.656 0L12 17.2l-1.772-1.772a4 4 0 10-5.656 5.656L6.343 22.8l5.657-5.657 5.657 5.657 1.771-1.716a4 4 0 000-5.656z"
        />
      </svg>
    ),
  },
  {
    path: "/patient/records",
    label: "Medical Records",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    path: "/patient/symptoms",
    label: "Symptom Checker",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
  },
  {
    path: "/patient/consultation",
    label: "Video Consultation",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    path: "/patient/payments",
    label: "Payments",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
  },
  {
    path: "/patient/notifications",
    label: "Notifications",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    ),
  },
];

function PatientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const [profileImage, setProfileImage] = useState("");
  const [profileName, setProfileName] = useState(user?.name || "Patient");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [imageError, setImageError] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchPatientProfile();
        const profile = response?.data?.profile;

        setProfileImage(profile?.profileImage || "");
        setProfileName(profile?.fullName || user?.name || "Patient");
        setProfileEmail(profile?.email || user?.email || "");
        setImageError(false);
      } catch (error) {
        setProfileImage("");
        setProfileName(user?.name || "Patient");
        setProfileEmail(user?.email || "");
        setImageError(false);
      }
    };

    loadProfile();

    const handleProfileUpdated = () => {
      loadProfile();
    };

    window.addEventListener("patient-profile-updated", handleProfileUpdated);

    return () => {
      window.removeEventListener("patient-profile-updated", handleProfileUpdated);
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "P";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return `${FILE_BASE_URL}${imagePath}`;
  };

  const resolvedImage = getImageUrl(profileImage);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 flex h-full w-56 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
            </svg>
          </div>
          <div>
            <span className="block text-base font-bold text-slate-800">MediConnect</span>
            <span className="text-xs text-slate-500">Patient Portal</span>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 px-2 py-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <div className="ml-56 flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Patient Dashboard</h2>
            <p className="text-sm text-slate-500">Welcome, {profileName}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/patient/notifications")}
              className="relative rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-teal-600 text-sm font-bold text-white">
                  {resolvedImage && !imageError ? (
                    <img
                      src={resolvedImage}
                      alt={profileName}
                      className="h-full w-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span>{getInitials(profileName)}</span>
                  )}
                </div>

                <div className="text-left">
                  <p className="text-sm font-medium text-slate-800">{profileName}</p>
                  <p className="text-xs text-slate-500">Patient</p>
                </div>

                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
                  <div className="border-b border-slate-100 px-4 pb-3">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                      {resolvedImage && !imageError ? (
                        <img
                          src={resolvedImage}
                          alt={profileName}
                          className="h-full w-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <span className="text-sm font-semibold text-teal-700">
                          {getInitials(profileName)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-800">{profileName}</p>
                    <p className="truncate text-xs text-slate-500">{profileEmail}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/patient/profile");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.121 17.804A9 9 0 1118.88 17.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    My Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PatientLayout;