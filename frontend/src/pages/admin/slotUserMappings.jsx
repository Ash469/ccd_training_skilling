import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "./adminNavbar";

export default function SlotUserMappings({ darkMode }) {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchMappings();
  }, []);

  const fetchMappings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/panels/slot-user-mappings`, config);
      setMappings(res.data);
    } catch {
      setNotification({ message: "Failed to fetch slot-user mappings", type: "error" });
    }
    setLoading(false);
  };

  const handleMarkCompleted = async (studentId) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/panels/slots/students/${studentId}/interview-completed`,
        {},
        config
      );
      setNotification({ message: "Interview marked as completed.", type: "success" });
      fetchMappings();
    } catch (err) {
      setNotification({
        message: err.response?.data?.message || "Failed to mark as completed",
        type: "error",
      });
    }
    setTimeout(() => setNotification({ message: "", type: "" }), 2000);
  };

  return (
    <>
      <AdminNavbar darkMode={darkMode} />
      <div className={`min-h-screen p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50"}`}>
        <h1 className="text-2xl font-bold mb-6">Slot to User Mappings</h1>

        {notification.message && (
          <div
            className={`mb-4 p-3 rounded ${
              notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {notification.message}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {mappings.map((mapping) => (
              <div key={mapping._id} className="p-4 rounded-lg shadow bg-white">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-lg">{mapping.studentName}</div>
                    <div className="text-sm text-gray-500">Slot Date: {new Date(mapping.slotDate).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-400 mt-1">Time: {mapping.startTime} - {mapping.endTime}</div>
                  </div>
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    onClick={() => handleMarkCompleted(mapping._id)}
                  >
                    Mark Completed
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}