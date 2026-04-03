import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Bell, CheckCircle, XCircle, Info } from "lucide-react";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const res = await axios.get("https://skill-gap-analysis-aetw.onrender.com/api/assessments/pending-retakes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccept = async (facultyId, skillId) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.post("https://skill-gap-analysis-aetw.onrender.com/api/assessments/reset", {
        facultyId,
        skillId
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      // Update local state to remove the notification immediately
      setNotifications(prev => prev.filter(n => !(n.facultyId === facultyId && n.skillId === skillId)));
    } catch (err) {
      alert("Failed to accept retake.");
    }
  };

  const handleReject = async (facultyId, skillId) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.post("https://skill-gap-analysis-aetw.onrender.com/api/assessments/reject-retake", {
        facultyId,
        skillId
      }, { headers: { Authorization: `Bearer ${token}` } });

      // Update local state to remove the notification immediately
      setNotifications(prev => prev.filter(n => !(n.facultyId === facultyId && n.skillId === skillId)));
    } catch (err) {
      alert("Failed to reject retake.");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button 
        onClick={() => { setIsOpen(!isOpen); if(!isOpen) fetchNotifications(); }}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
      >
        <Bell size={22} className="text-slate-600" />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Notifications</h3>
            {notifications.length > 0 && (
              <span className="text-xs font-semibold bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full">
                {notifications.length} New
              </span>
            )}
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-500 flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-teal-500 border-t-transparent"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                <Bell size={32} className="text-slate-300 mx-auto" />
                <p className="text-sm text-slate-500 font-medium mt-2">All caught up!</p>
                <p className="text-xs text-slate-400">No pending retake requests.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notif, idx) => (
                  <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold flex-shrink-0 text-sm">
                        {notif.facultyName?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800 leading-snug">
                          <span className="font-semibold">{notif.facultyName}</span> has requested a test retake for <span className="font-semibold text-teal-700">{notif.skillName}</span>.
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(notif.requestedAt).toLocaleString()}
                        </p>
                        
                        <div className="flex gap-2 mt-3">
                          <button 
                            onClick={() => handleAccept(notif.facultyId, notif.skillId)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                          >
                            <CheckCircle size={14} /> Accept
                          </button>
                          <button 
                            onClick={() => handleReject(notif.facultyId, notif.skillId)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
