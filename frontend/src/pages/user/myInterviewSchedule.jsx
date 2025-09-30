import React, { useEffect, useState } from "react";
import axios from "axios";
import UserNavbar from "./userNavbar";

export default function MyInterviewSchedule({ darkMode, user }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: "", type: "" });

  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(
          `${API_BASE_URL}/api/panels/my-interview-schedule`,
          config
        );
        setSchedule(res.data.schedule || []);
      } catch (err) {
        setNotification({
          message: "Failed to fetch interview schedule.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [API_BASE_URL]);

  return (
    <>
      <UserNavbar darkMode={darkMode} user={user} toggleDarkMode={() => {}} />
      <div
        className={`min-h-screen p-6 ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-50"
        }`}
      >
        <h1 className="text-2xl font-bold mb-6">My Mock Interview Schedule</h1>

        {loading && (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-purple-600"></div>
          </div>
        )}

        {notification.message && (
          <div
            className={`mb-4 p-3 rounded ${
              notification.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {notification.message}
          </div>
        )}

        {!loading && schedule.length === 0 && (
          <div className="text-center text-gray-500">
            No interview schedule found.
          </div>
        )}

        <div className="grid gap-4">
          {schedule.map((slot) => (
            <div
              key={slot.slotId || slot._id}
              className={`p-4 rounded shadow flex flex-col md:flex-row md:justify-between md:items-center ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div>
                <div>
                  <b>Date:</b>{" "}
                  {slot.date
                    ? new Date(slot.date).toLocaleDateString()
                    : "N/A"}
                </div>
                <div>
                  <b>Time:</b> {slot.startTime || "N/A"} - {slot.endTime || "N/A"}
                </div>
                {slot.panelName && (
                  <div>
                    <b>Panel:</b> {slot.panelName}
                  </div>
                )}
                {slot.location && (
                  <div>
                    <b>Location:</b> {slot.location}
                  </div>
                )}
                {slot.interviewer && (
                  <div>
                    <b>Interviewer:</b> {slot.interviewer}
                  </div>
                )}
              </div>
              {slot.status && (
                <span
                  className={`mt-2 md:mt-0 px-3 py-1 rounded-full text-xs font-semibold ${
                    slot.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : slot.status === "Upcoming"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {slot.status}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}