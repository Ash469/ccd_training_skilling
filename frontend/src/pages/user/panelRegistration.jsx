import React, { useEffect, useState } from "react";
import axios from "axios";
import UserNavbar from "./userNavbar";

export default function PanelRegistration({ darkMode }) {
  const [slots, setSlots] = useState([]);
  const [registeredSlot, setRegisteredSlot] = useState(null);
  const [status, setStatus] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [user, setUser] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const res = await axios.get(
          `${API_BASE_URL}/api/panels/eligible-slots`,
          config
        );

        // ensure slots are sorted by date + startTime
        const sorted = res.data.slots.sort((a, b) => {
          const dateA = new Date(a.date).setHours(...a.startTime.split(":"));
          const dateB = new Date(b.date).setHours(...b.startTime.split(":"));
          return dateA - dateB;
        });

        setSlots(sorted);
        setRegisteredSlot(res.data.registeredSlot);
        setStatus(res.data.status);
      } catch (err) {
        setNotification({
          message: "Failed to fetch slots",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [API_BASE_URL]);

  const handleRegister = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.post(
        `${API_BASE_URL}/api/panels/register`,
        { panelId: selectedSlot.panelId, slotId: selectedSlot.slotId },
        config
      );

      setNotification({ message: "Registered successfully!", type: "success" });
      setRegisteredSlot(selectedSlot.slotId);
      setStatus(false);
      setShowConfirm(false);

      const res = await axios.get(
        `${API_BASE_URL}/api/panels/eligible-slots`,
        config
      );
      setSlots(res.data.slots);
    } catch (err) {
      setNotification({
        message: err.response?.data?.message || "Registration failed",
        type: "error",
      });
      setShowConfirm(false);
    }
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-purple-600"></div>
      </div>
    );

  if (!status)
    return (
      <>
        <UserNavbar darkMode={darkMode} user={user} />
        <div className="p-8 text-center text-red-500 font-semibold">
          You have already registered for a slot.
          <br />
          Please contact admin if you need to register again.
        </div>
      </>
    );

  // group slots by date
  const groupedSlots = slots.reduce((acc, slot) => {
    const dateKey = new Date(slot.date).toLocaleDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {});

  return (
    <>
      <UserNavbar darkMode={darkMode} user={user} />
      <div
        className={`min-h-screen p-6 ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-50"
        }`}
      >
        <h1 className="text-2xl font-bold mb-6">Mock Interview Slot Registration</h1>

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

        {Object.entries(groupedSlots).length === 0 ? (
          <div>No available slots at the moment.</div>
        ) : (
          Object.entries(groupedSlots).map(([day, daySlots]) => (
            <div key={day} className="mb-6">
              <h2 className="font-semibold text-lg mb-3">{day}</h2>
              <div className="grid gap-4">
                {daySlots.map((slot) => (
                  <div
                    key={slot.slotId}
                    className={`p-4 rounded shadow flex justify-between items-center ${
                      darkMode ? "bg-gray-800" : "bg-white"
                    } ${
                      registeredSlot === slot.slotId
                        ? "border-2 border-green-500"
                        : ""
                    }`}
                  >
                    <div>
                      <b>Panel:</b> {slot.panelName} <br />
                      <b>Time:</b> {slot.startTime} - {slot.endTime}
                    </div>
                    <button
                      disabled={registeredSlot === slot.slotId}
                      className={`mt-2 px-4 py-2 rounded ${
                        registeredSlot === slot.slotId
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-purple-600 text-white hover:bg-purple-700"
                      }`}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setShowConfirm(true);
                      }}
                    >
                      {registeredSlot === slot.slotId
                        ? "Registered"
                        : "Register"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {showConfirm && selectedSlot && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div
              className={`p-6 rounded-xl shadow-lg w-96 ${
                darkMode ? "bg-gray-800 text-white" : "bg-white"
              }`}
            >
              <h2 className="font-semibold text-lg mb-3">
                Confirm Registration
              </h2>
              <p>
                Are you sure you want to register for{" "}
                <b>{new Date(selectedSlot.date).toLocaleDateString()}</b>{" "}
                {selectedSlot.startTime} - {selectedSlot.endTime}?
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegister}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
