import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "./adminNavbar";
import jsPDF from "jspdf";

export default function PanelManagement({ darkMode }) {
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPanelModal, setShowPanelModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [newPanel, setNewPanel] = useState({
    name: "",
    description: "",
    capacity: 1,
    registeredStudents: [],
  });
  const [newSlot, setNewSlot] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });
  const [slotAssignments, setSlotAssignments] = useState([]);
  const [viewSlotsPanel, setViewSlotsPanel] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [editUserSearch, setEditUserSearch] = useState("");
  const [selectedUsersForEdit, setSelectedUsersForEdit] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [viewPanel, setViewPanel] = useState(null);
  const [file, setFile] = useState(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [slotfile, setSlotFile] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchPanels();
    fetchUsers();
  }, []);

  const fetchPanels = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/panels`, config);
      setPanels(res.data);
    } catch {
      setNotification({ message: "Failed to fetch panels", type: "error" });
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users`, config);
      setAllUsers(res.data);
    } catch {
      setNotification({ message: "Failed to fetch users", type: "error" });
    }
  };

  const handleAddPanel = async () => {
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", newPanel.name);
      formData.append("description", newPanel.description);
      formData.append("capacity", newPanel.capacity);
      formData.append("sendEmailNotification", sendEmail);

      // Pass selected users (if any) as JSON string
      if (newPanel.registeredStudents.length > 0) {
        formData.append(
          "registeredStudents",
          JSON.stringify(newPanel.registeredStudents)
        );
      }

      // Pass the file if chosen
      if (file) {
        formData.append("file", file);
      }

      await axios.post(`${API_BASE_URL}/api/panels`, formData, {
        headers: {
          ...config.headers,
          "Content-Type": "multipart/form-data",
        },
      });

      setShowPanelModal(false);
      setNewPanel({
        name: "",
        description: "",
        capacity: 1,
        registeredStudents: [],
      });
      setFile(null);
      fetchPanels();
      setNotification({
        message: "Panel added successfully!",
        type: "success",
      });
    } catch (err) {
      setNotification({
        message: err.response?.data?.message || "Failed to add panel",
        type: "error",
      });
    }

    setSubmitting(false);
    setTimeout(() => setNotification({ message: "", type: "" }), 2500);
  };

  const isConflict = (newSlot, existingSlots) => {
    const newStart = new Date(`${newSlot.date}T${newSlot.startTime}`);
    const newEnd = new Date(`${newSlot.date}T${newSlot.endTime}`);

    return existingSlots.some((s) => {
      if (s.date !== newSlot.date) return false; // only check slots on the same date
      const sStart = new Date(`${s.date}T${s.startTime}`);
      const sEnd = new Date(`${s.date}T${s.endTime}`);

      // overlap exists if intervals intersect
      return newStart < sEnd && newEnd > sStart;
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAddSlot = async () => {
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      setNotification({
        message: "Please fill all slot fields",
        type: "error",
      });
      setTimeout(() => setNotification({ message: "", type: "" }), 2000);
      return;
    }

    if (newSlot.startTime >= newSlot.endTime) {
      setNotification({
        message: "End time must be after start time",
        type: "error",
      });
      setTimeout(() => setNotification({ message: "", type: "" }), 2000);
      return;
    }

    // Conflict check before calling backend
    if (isConflict(newSlot, selectedPanel.slots)) {
      setNotification({
        message: "Slot conflicts with an existing one",
        type: "error",
      });
      setTimeout(() => setNotification({ message: "", type: "" }), 2000);
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/panels/${selectedPanel._id}/slots`,
        { ...newSlot, sendEmailNotification: sendEmail },
        config
      );
      setShowSlotModal(false);
      setNewSlot({ date: "", startTime: "", endTime: "" });
      fetchPanels();
      setNotification({ message: "Slot added successfully!", type: "success" });
    } catch (err) {
      setNotification({
        message: err.response?.data?.message || "Failed to add slot",
        type: "error",
      });
    }
    setSubmitting(false);
    setTimeout(() => setNotification({ message: "", type: "" }), 2500);
  };

  const handleViewSlots = async (panel) => {
    setViewSlotsPanel(panel);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/panels/${panel._id}/slots`,
        config
      );
      setSlotAssignments(res.data.slots);
    } catch {
      setNotification({
        message: "Failed to fetch slot assignments",
        type: "error",
      });
    }
  };

  const handleMarkCompleted = async (studentId) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/panels/students/${studentId}/interview-completed`,
        {},
        config
      );
      setNotification({
        message: "Interview marked as completed.",
        type: "success",
      });
      if (viewSlotsPanel) handleViewSlots(viewSlotsPanel);
    } catch (err) {
      setNotification({
        message: err.response?.data?.message || "Failed to mark as completed",
        type: "error",
      });
    }
    setTimeout(() => setNotification({ message: "", type: "" }), 2000);
  };

  const toggleUserSelection = (userId) => {
    setNewPanel((prev) => {
      const exists = prev.registeredStudents.includes(userId);
      return {
        ...prev,
        registeredStudents: exists
          ? prev.registeredStudents.filter((id) => id !== userId)
          : [...prev.registeredStudents, userId],
      };
    });
  };

  const removeSelectedUser = (userId) => {
    setNewPanel((prev) => ({
      ...prev,
      registeredStudents: prev.registeredStudents.filter((id) => id !== userId),
    }));
  };

  const handleDeletePanel = async (panelId) => {
    if (!window.confirm("Are you sure you want to delete this panel?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/panels/${panelId}`, config);
      setNotification({
        message: "Panel deleted successfully!",
        type: "success",
      });
      fetchPanels();
    } catch (err) {
      setNotification({
        message: err.response?.data?.message || "Failed to delete panel",
        type: "error",
      });
    }
    setTimeout(() => setNotification({ message: "", type: "" }), 2000);
  };

  const deleteSlot = async (panelId, slotId) => {
    if (
      !window.confirm(
        "Deleting this slot will also unassign any students linked to it. Continue?"
      )
    ) {
      return;
    }

    console.log(`Deleting slot ${slotId} from panel ${panelId}`);
    console.log(slotAssignments);
    console.log(viewSlotsPanel);

    setSubmitting(true);
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/api/panels/${panelId}/slots/${slotId}`,
        config
      );

      // Refresh slots view if inside modal
      if (viewSlotsPanel && viewSlotsPanel._id === panelId) {
        await handleViewSlots(viewSlotsPanel);
      } else {
        fetchPanels();
      }

      setNotification({
        message: res.data?.message || "Slot deleted successfully!",
        type: "success",
      });
    } catch (err) {
      setNotification({
        message: err.response?.data?.message || "Failed to delete slot",
        type: "error",
      });
    }
    setSubmitting(false);
    setTimeout(() => setNotification({ message: "", type: "" }), 2500);
  };

  const handleFileUpload = async (panelId, file) => {
    if (!window.confirm("Adding the list of slots in bulk. Continue?")) {
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sendEmailNotification", sendEmail);

    try {
      await axios.post(
        `${API_BASE_URL}/api/panels/${panelId}/slots/upload-excel`,
        formData,
        {
          ...config,
          headers: { ...config.headers, "Content-Type": "multipart/form-data" },
        }
      );

      fetchPanels();
      setNotification({
        message: "Slots uploaded successfully!",
        type: "success",
      });
    } catch (err) {
      setNotification({
        message: err.response?.data?.message || "Failed to upload slots",
        type: "error",
      });
    }
    setTimeout(() => setNotification({ message: "", type: "" }), 2500);
  };

  const handleEditPanel = (panel) => {
    setSelectedPanel(panel);
    setShowEditModal(true);
  };

  const handleAddUsersToPanel = async (panelId, userIds) => {
    setSubmitting(true);
    try {
      await axios.put(
        `${API_BASE_URL}/api/panels/${panelId}/add-users`,
        { userIds, sendEmail: true },
        config
      );

      setSelectedPanel((prev) => ({
        ...prev,
        registeredStudents: [...prev.registeredStudents, ...userIds],
      }));

      fetchPanels();
      setNotification({
        message: "Users added to panel successfully!",
        type: "success",
      });
    } catch (err) {
      setNotification({
        message: err.response?.data?.message || "Failed to add users to panel",
        type: "error",
      });
    }
    setSubmitting(false);
    setTimeout(() => setNotification({ message: "", type: "" }), 2500);
  };

  const handleRemoveUserFromPanel = async (panelId, userId) => {
    setSubmitting(true);
    try {
      await axios.put(
        `${API_BASE_URL}/api/panels/${panelId}/remove-user`,
        { userId },
        config
      );

      setSelectedPanel((prev) => ({
        ...prev,
        registeredStudents: prev.registeredStudents.filter(
          (id) => id !== userId
        ),
      }));

      fetchPanels();
      setNotification({
        message: "User removed from panel successfully!",
        type: "success",
      });
    } catch (err) {
      setNotification({
        message:
          err.response?.data?.message || "Failed to remove user from panel",
        type: "error",
      });
    }
    setSubmitting(false);
    setTimeout(() => setNotification({ message: "", type: "" }), 2500);
  };

  // Simple PDF generation without autotable
  const generateSlotsPDF = (panel, slotAssignments, filterType = "all") => {
    const doc = new jsPDF();
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    // Helper function to add new page if needed
    const checkNewPage = (requiredSpace = 10) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    // Helper function to draw text with wrapping
    const addText = (text, x, y, options = {}) => {
      const maxWidth = options.maxWidth || pageWidth - 40;
      const lineHeight = options.lineHeight || 7;

      if (typeof text !== "string") {
        text = String(text);
      }

      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line, index) => {
        if (checkNewPage() && index > 0) {
          // Continue on new page
        }
        doc.text(line, x, y + index * lineHeight);
      });

      return lines.length * lineHeight;
    };

    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    yPosition += addText(`${panel.name} - Mock Interview Slots`, 20, yPosition);
    yPosition += 5;

    // Subtitle
    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    const subtitle =
      filterType === "future"
        ? "Upcoming Slots (After Current Time)"
        : "All Slots (Past + Future)";
    yPosition += addText(subtitle, 20, yPosition);
    yPosition += 5;

    // Panel details
    doc.setFontSize(10);
    yPosition += addText(`Description: ${panel.description}`, 20, yPosition);
    yPosition += addText(
      `Capacity: ${panel.capacity} | Registered Students: ${panel.registeredStudents.length}`,
      20,
      yPosition
    );
    yPosition += addText(
      `Generated on: ${new Date().toLocaleString()}`,
      20,
      yPosition
    );
    yPosition += 10;

    // Filter slots
    const currentDateTime = new Date();
    let filteredSlots = slotAssignments;

    function normalizeDateTime(dateStr, timeStr) {
      // Case 1: Already full ISO string
      if (dateStr.includes("T")) {
        const d = new Date(dateStr);
        if (!isNaN(d)) {
          // Override the time part manually
          const [hours, minutes] = timeStr.split(":").map(Number);
          d.setHours(hours, minutes, 0, 0);
          return d;
        }
      }

      // Case 2: YYYY-MM-DD
      if (dateStr.includes("-")) {
        return new Date(`${dateStr}T${timeStr}`);
      }

      // Case 3: MM/DD/YYYY
      if (dateStr.includes("/")) {
        const [month, day, year] = dateStr.split("/");
        return new Date(
          `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${timeStr}`
        );
      }

      // Fallback
      return new Date(`${dateStr} ${timeStr}`);
    }

    if (filterType === "future") {
      filteredSlots = slotAssignments.filter((slot) => {
        const slotDateTime = normalizeDateTime(slot.date, slot.startTime);
        console.log(
          slot.date,
          slot.startTime,
          slotDateTime,
          "Future?",
          slotDateTime > currentDateTime
        );
        return slotDateTime > currentDateTime;
      });
    }

    // Sort slots
    filteredSlots.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA - dateB;
    });

    // Draw table header
    checkNewPage(20);
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");

    // Draw header background
    doc.setFillColor(74, 144, 226);
    doc.rect(15, yPosition - 5, pageWidth - 30, 10, "F");

    // Header text (white)
    doc.setTextColor(255, 255, 255);
    doc.text("#", 18, yPosition);
    doc.text("Date", 30, yPosition);
    doc.text("Time", 65, yPosition);
    doc.text("Status", 100, yPosition);
    doc.text("Student Name", 125, yPosition);
    doc.text("Email", 165, yPosition);

    yPosition += 10;
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFont(undefined, "normal");

    // Table content
    let slotIndex = 1;
    filteredSlots.forEach((slot) => {
      const slotDate = new Date(slot.date).toLocaleDateString();
      const timeSlot = `${slot.startTime}-${slot.endTime}`;
      const status = slot.isBooked ? "Booked" : "Available";

      if (slot.students.length === 0) {
        checkNewPage(8);

        // Alternating row colors
        if (slotIndex % 2 === 0) {
          doc.setFillColor(240, 240, 240);
          doc.rect(15, yPosition - 6, pageWidth - 30, 8, "F");
        }

        doc.text(String(slotIndex), 18, yPosition);
        doc.text(slotDate, 30, yPosition);
        doc.text(timeSlot, 65, yPosition);
        doc.text(status, 100, yPosition);
        doc.text("No students assigned", 125, yPosition);

        yPosition += 8;
        slotIndex++;
      } else {
        slot.students.forEach((student, stuIndex) => {
          checkNewPage(8);

          // Alternating row colors
          if (slotIndex % 2 === 0) {
            doc.setFillColor(240, 240, 240);
            doc.rect(15, yPosition - 6, pageWidth - 30, 8, "F");
          }

          // Only show slot info for first student
          if (stuIndex === 0) {
            doc.text(String(slotIndex), 18, yPosition);
            doc.text(slotDate, 30, yPosition);
            doc.text(timeSlot, 65, yPosition);
            doc.text(status, 100, yPosition);
          }

          const studentName = student.fullName || student.name || "N/A";
          const studentEmail = student.email || "N/A";

          // Truncate long text to fit
          const maxNameLength = 25;
          const maxEmailLength = 25;
          const displayName =
            studentName.length > maxNameLength
              ? studentName.substring(0, maxNameLength) + "..."
              : studentName;
          const displayEmail =
            studentEmail.length > maxEmailLength
              ? studentEmail.substring(0, maxEmailLength) + "..."
              : studentEmail;

          doc.text(displayName, 125, yPosition);
          doc.text(displayEmail, 165, yPosition);

          yPosition += 8;
        });
        slotIndex++;
      }
    });

    // Summary section
    yPosition += 10;
    checkNewPage(30);

    doc.setFont(undefined, "bold");
    doc.setFontSize(12);
    yPosition += addText("Summary:", 20, yPosition);

    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    yPosition += addText(`Total Slots: ${filteredSlots.length}`, 20, yPosition);

    const bookedSlots = filteredSlots.filter((s) => s.isBooked).length;
    const availableSlots = filteredSlots.length - bookedSlots;
    yPosition += addText(`Booked Slots: ${bookedSlots}`, 20, yPosition);
    yPosition += addText(`Available Slots: ${availableSlots}`, 20, yPosition);

    const totalStudents = filteredSlots.reduce(
      (acc, slot) => acc + slot.students.length,
      0
    );
    yPosition += addText(
      `Total Students Assigned: ${totalStudents}`,
      20,
      yPosition
    );

    return doc;
  };

  // Updated handlePrintSlots function
  const handlePrintSlots = async (panel, filterType = "all") => {
    try {
      setNotification({
        message: "Generating PDF...",
        type: "success",
      });

      // Fetch fresh slot data
      const res = await axios.get(
        `${API_BASE_URL}/api/panels/${panel._id}/slots`,
        config
      );

      const slotsData = res.data.slots;

      if (!slotsData || slotsData.length === 0) {
        setNotification({
          message: "No slots found to export",
          type: "error",
        });
        setTimeout(() => setNotification({ message: "", type: "" }), 2500);
        return;
      }

      const doc = generateSlotsPDF(panel, slotsData, filterType);

      // Generate filename
      const dateStr = new Date().toISOString().split("T")[0];
      const filterStr = filterType === "future" ? "_upcoming" : "_all";
      const panelName = panel.name.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `${panelName}_slots${filterStr}_${dateStr}.pdf`;

      // Save the PDF
      doc.save(filename);

      setNotification({
        message: "PDF generated successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      setNotification({
        message: `Failed to generate PDF: ${error.message || "Unknown error"}`,
        type: "error",
      });
    }
    setTimeout(() => setNotification({ message: "", type: "" }), 2500);
  };

  return (
    <>
      <AdminNavbar darkMode={darkMode} />
      <div
        className={`min-h-screen p-6 ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-50"
        }`}
      >
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold mb-6">Panel Management</h1>

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

          <button
            className="mb-6 px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700 transition-colors"
            onClick={() => setShowPanelModal(true)}
          >
            ➕ Add Panel
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {panels.map((panel) => (
              <div
                key={panel._id}
                className={`p-6 rounded-lg shadow transition hover:shadow-lg ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-lg mb-2">
                      {panel.name}
                    </div>
                    <div
                      className={`text-sm mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {panel.description}
                    </div>
                    <div
                      className={`text-xs mb-2 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <span className="inline-block mr-4">
                        <span className="font-medium">Capacity:</span>{" "}
                        {panel.capacity}
                      </span>
                      <span className="inline-block mr-4">
                        <span className="font-medium">Registered:</span>{" "}
                        {panel.registeredStudents.length}
                      </span>
                      <span className="inline-block">
                        <span className="font-medium">Total Slots:</span>{" "}
                        {panel.slots.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 ml-4">
                    <button
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1"
                      onClick={() => handleEditPanel(panel)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-1"
                      onClick={() => handleViewSlots(panel)}
                    >
                      📅 View Slots
                    </button>
                    <button
                      className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1"
                      onClick={() => setViewPanel(panel)}
                    >
                      👁 Details
                    </button>
                    {/* PDF Export Dropdown */}
                    <div className="relative group">
                      <button className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm font-medium flex items-center gap-1">
                        📄 Export PDF
                        <svg
                          className="w-3 h-3 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <button
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-t-md"
                          onClick={() => handlePrintSlots(panel, "all")}
                        >
                          All Slots (Past + Future)
                        </button>
                        <button
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-b-md"
                          onClick={() => handlePrintSlots(panel, "future")}
                        >
                          Upcoming Slots Only
                        </button>
                      </div>
                    </div>
                    <button
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-1"
                      onClick={() => handleDeletePanel(panel._id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Panel Modal */}
        {showPanelModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div
              className={`p-6 rounded-lg shadow-lg w-full max-w-lg relative ${
                darkMode ? "bg-gray-800 text-white" : "bg-white"
              } max-h-[80vh] overflow-y-auto`}
            >
              <h2 className="text-lg font-bold mb-4">Add Panel</h2>

              <input
                type="text"
                placeholder="Panel Name"
                value={newPanel.name}
                onChange={(e) =>
                  setNewPanel({ ...newPanel, name: e.target.value })
                }
                className="w-full mb-2 p-2 rounded border"
              />
              <input
                type="text"
                placeholder="Description"
                value={newPanel.description}
                onChange={(e) =>
                  setNewPanel({ ...newPanel, description: e.target.value })
                }
                className="w-full mb-2 p-2 rounded border"
              />
              <input
                type="number"
                placeholder="Capacity"
                value={newPanel.capacity}
                min={1}
                onChange={(e) =>
                  setNewPanel({ ...newPanel, capacity: Number(e.target.value) })
                }
                className="w-full mb-4 p-2 rounded border"
              />

              {/* New Excel Upload */}
              <div className="mb-4">
                <label className="block font-semibold mb-1">
                  Upload Excel (Emails)
                </label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full p-2 border rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The Excel file should have a column named <b>Email</b>.
                </p>
              </div>

              {/* User selection with search + checkboxes */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold">Assign Students</label>
                  <button
                    className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                    onClick={() => {
                      setNewPanel((prev) => {
                        const allIds = allUsers.map((u) => u._id);
                        const isAllSelected =
                          prev.registeredStudents.length === allIds.length;

                        return {
                          ...prev,
                          registeredStudents: isAllSelected ? [] : allIds,
                          selectAll: !isAllSelected,
                        };
                      });
                    }}
                  >
                    {newPanel.registeredStudents.length === allUsers.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full mb-3 p-2 rounded border"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-1">
                  {allUsers
                    .filter(
                      (user) =>
                        !userSearch ||
                        user.fullName
                          .toLowerCase()
                          .includes(userSearch.toLowerCase()) ||
                        user.email
                          .toLowerCase()
                          .includes(userSearch.toLowerCase())
                    )
                    .map((user) => (
                      <label
                        key={user._id}
                        className="flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={newPanel.registeredStudents.includes(
                            user._id
                          )}
                          onChange={() => toggleUserSelection(user._id)}
                        />
                        {user.fullName}{" "}
                        <span className="text-gray-400">({user.email})</span>
                      </label>
                    ))}
                </div>

                {/* Chips for selected users */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {newPanel.registeredStudents.map((id) => {
                    const user = allUsers.find((u) => u._id === id);
                    return (
                      user && (
                        <span
                          key={id}
                          className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs flex items-center gap-1"
                        >
                          {user.fullName}
                          <button
                            className="ml-1 text-red-600 hover:text-red-800"
                            onClick={() => removeSelectedUser(id)}
                          >
                            ✕
                          </button>
                        </span>
                      )
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 mt-4 justify-end">
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setShowPanelModal(false)}
                >
                  Cancel
                </button>
                <button
                  disabled={submitting}
                  className={`px-4 py-2 rounded text-white ${
                    submitting
                      ? "bg-purple-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                  onClick={handleAddPanel}
                >
                  {submitting ? "Adding..." : "Add Panel"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Panel Modal */}
        {showEditModal && selectedPanel && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div
              className={`p-6 rounded-lg shadow-lg w-full max-w-2xl relative ${
                darkMode ? "bg-gray-800 text-white" : "bg-white"
              } max-h-[90vh] overflow-y-auto`}
            >
              <h2 className="text-lg font-bold mb-6">
                Edit Panel - {selectedPanel.name}
              </h2>

              <div className="space-y-6">
                {/* Add Time Slot Section */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    ⏰ Add Time Slot
                  </h3>
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="date"
                      value={newSlot.date}
                      onChange={(e) =>
                        setNewSlot({ ...newSlot, date: e.target.value })
                      }
                      className="w-full p-2 rounded border"
                    />
                    <div className="flex gap-2">
                      <input
                        type="time"
                        placeholder="Start Time"
                        value={newSlot.startTime}
                        onChange={(e) =>
                          setNewSlot({ ...newSlot, startTime: e.target.value })
                        }
                        className="flex-1 p-2 rounded border"
                      />
                      <input
                        type="time"
                        placeholder="End Time"
                        value={newSlot.endTime}
                        onChange={(e) =>
                          setNewSlot({ ...newSlot, endTime: e.target.value })
                        }
                        className="flex-1 p-2 rounded border"
                      />
                    </div>
                    <button
                      disabled={submitting}
                      className={`w-full py-2 rounded text-white ${
                        submitting
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      onClick={handleAddSlot}
                    >
                      {submitting ? "Adding..." : "Add Slot"}
                    </button>
                  </div>
                </div>

                {/* Upload CSV Section */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    📁 Upload Slots from CSV
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => setSlotFile(e.target.files[0])}
                      className="w-full p-2 border rounded"
                    />
                    <button
                      disabled={!slotfile || submitting}
                      className={`w-full py-2 rounded text-white ${
                        submitting || !slotfile
                          ? "bg-green-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                      onClick={() =>
                        handleFileUpload(selectedPanel._id, slotfile)
                      }
                    >
                      {submitting ? "Uploading..." : "Upload Slots"}
                    </button>
                  </div>
                </div>

                {/* Email Notification Section */}
                <div
                  className={`p-6 rounded-lg ${
                    darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-purple-100"
                  } border shadow-sm`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <label
                      className={`font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Send email notification to all users
                    </label>
                  </div>
                  <p
                    className={`text-sm mt-2 ml-7 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    All registered users will receive an email notification
                    about addition of new slot
                  </p>
                </div>

                {/* Manage Users Section */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    👥 Manage Registered Users
                  </h3>

                  {/* Current Registered Users */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">
                      Currently Registered (
                      {selectedPanel.registeredStudents.length})
                    </h4>
                    <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                      {selectedPanel.registeredStudents.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No users registered
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {selectedPanel.registeredStudents.map((userId) => {
                            const user = allUsers.find((u) => u._id === userId);
                            return user ? (
                              <div
                                key={userId}
                                className="flex justify-between items-center text-sm py-1"
                              >
                                <span>
                                  {user.fullName} ({user.email})
                                </span>
                                <button
                                  onClick={() =>
                                    handleRemoveUserFromPanel(
                                      selectedPanel._id,
                                      userId
                                    )
                                  }
                                  className="text-red-600 hover:text-red-800 text-xs"
                                  disabled={submitting}
                                >
                                  Remove
                                </button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add New Users */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Add New Users</h4>
                      <button
                        className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                        onClick={() => {
                          const unregisteredUsers = allUsers.filter(
                            (user) =>
                              !selectedPanel.registeredStudents.includes(
                                user._id
                              )
                          );
                          const allUnregisteredIds = unregisteredUsers.map(
                            (u) => u._id
                          );
                          const isAllSelected =
                            selectedUsersForEdit.length ===
                            allUnregisteredIds.length;

                          setSelectedUsersForEdit(
                            isAllSelected ? [] : allUnregisteredIds
                          );
                        }}
                      >
                        {(() => {
                          const unregisteredUsers = allUsers.filter(
                            (user) =>
                              !selectedPanel.registeredStudents.includes(
                                user._id
                              )
                          );
                          return selectedUsersForEdit.length ===
                            unregisteredUsers.length
                            ? "Deselect All"
                            : "Select All";
                        })()}
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Search users to add..."
                      className="w-full mb-3 p-2 rounded border"
                      value={editUserSearch}
                      onChange={(e) => setEditUserSearch(e.target.value)}
                    />

                    <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-1 bg-white">
                      {allUsers
                        .filter(
                          (user) =>
                            !selectedPanel.registeredStudents.includes(
                              user._id
                            ) &&
                            (!editUserSearch ||
                              user.fullName
                                .toLowerCase()
                                .includes(editUserSearch.toLowerCase()) ||
                              user.email
                                .toLowerCase()
                                .includes(editUserSearch.toLowerCase()))
                        )
                        .map((user) => (
                          <label
                            key={user._id}
                            className="flex items-center gap-2 cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={selectedUsersForEdit.includes(user._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsersForEdit((prev) => [
                                    ...prev,
                                    user._id,
                                  ]);
                                } else {
                                  setSelectedUsersForEdit((prev) =>
                                    prev.filter((id) => id !== user._id)
                                  );
                                }
                              }}
                            />
                            {user.fullName}{" "}
                            <span className="text-gray-400">
                              ({user.email})
                            </span>
                          </label>
                        ))}
                    </div>

                    {/* Selected Users Chips */}
                    {selectedUsersForEdit.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-2">
                          Selected users to add ({selectedUsersForEdit.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedUsersForEdit.map((id) => {
                            const user = allUsers.find((u) => u._id === id);
                            return user ? (
                              <span
                                key={id}
                                className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs flex items-center gap-1"
                              >
                                {user.fullName}
                                <button
                                  className="ml-1 text-red-600 hover:text-red-800"
                                  onClick={() => {
                                    setSelectedUsersForEdit((prev) =>
                                      prev.filter((userId) => userId !== id)
                                    );
                                  }}
                                >
                                  ✕
                                </button>
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {selectedUsersForEdit.length > 0 && (
                      <button
                        onClick={() => {
                          handleAddUsersToPanel(
                            selectedPanel._id,
                            selectedUsersForEdit
                          );
                          setSelectedUsersForEdit([]);
                          setEditUserSearch("");
                        }}
                        disabled={submitting}
                        className={`w-full mt-3 py-2 rounded text-white ${
                          submitting
                            ? "bg-green-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {submitting
                          ? "Adding Users..."
                          : `Add ${selectedUsersForEdit.length} User(s)`}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6 justify-end">
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPanel(null);
                    setNewSlot({ date: "", startTime: "", endTime: "" });
                    setSelectedUsersForEdit([]);
                    setEditUserSearch("");
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Slot Assignments Modal */}
        {viewSlotsPanel && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div
              className={`p-6 rounded-lg shadow-lg w-full max-w-2xl relative ${
                darkMode ? "bg-gray-800 text-white" : "bg-white"
              } max-h-[80vh] overflow-y-auto`}
            >
              <h2 className="text-lg font-bold mb-4">
                Slots for {viewSlotsPanel.name}
              </h2>

              {/* PDF Export buttons in modal */}
              <div className="flex gap-2 mb-2.5">
                <button
                  className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm font-medium"
                  onClick={() => handlePrintSlots(viewSlotsPanel, "all")}
                >
                  📄 Export All Slots
                </button>
                <button
                  className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm font-medium"
                  onClick={() => handlePrintSlots(viewSlotsPanel, "future")}
                >
                  📄 Export Upcoming
                </button>
              </div>
              <button
                className="absolute top-4 right-6 text-xl"
                onClick={() => setViewSlotsPanel(null)}
              >
                &times;
              </button>
              <div className="grid gap-4">
                {slotAssignments.length === 0 ? (
                  <div>No slots found.</div>
                ) : (
                  slotAssignments.map((slot) => (
                    <div
                      key={slot._id}
                      className="p-3 rounded border mb-2 bg-gray-50"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <b>Date:</b>{" "}
                          {new Date(slot.date).toLocaleDateString()}{" "}
                          <b>Time:</b> {slot.startTime} - {slot.endTime}
                          <div className="mt-1">
                            <b>Booked:</b>{" "}
                            <span
                              className={
                                slot.isBooked
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {slot.isBooked ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              deleteSlot(viewSlotsPanel._id, slot.slotId)
                            }
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                            disabled={submitting}
                          >
                            Delete Slot
                          </button>
                        </div>
                      </div>

                      <div className="mt-3">
                        <b>Students:</b>{" "}
                        {slot.students.length === 0 ? (
                          "None"
                        ) : (
                          <div className="flex flex-col gap-2 mt-2">
                            {slot.students.map((stu) => (
                              <div
                                key={stu._id}
                                className="flex justify-between items-center text-sm bg-gray-100  p-2 rounded"
                              >
                                <span>
                                  {stu.fullName || stu.name} ({stu.email})
                                </span>
                                <button
                                  className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                  onClick={() => handleMarkCompleted(stu._id)}
                                >
                                  Mark Completed
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {viewPanel && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div
              className={`p-6 rounded-lg shadow-lg w-full max-w-2xl relative ${
                darkMode ? "bg-gray-800 text-white" : "bg-white"
              } max-h-[80vh] overflow-y-auto`}
            >
              <h2 className="text-lg font-bold mb-4">
                {viewPanel.name} - Details
              </h2>
              <button
                className="absolute top-4 right-6 text-xl"
                onClick={() => setViewPanel(null)}
              >
                &times;
              </button>

              <p>
                <b>Description:</b> {viewPanel.description}
              </p>
              <p>
                <b>Capacity:</b> {viewPanel.capacity}
              </p>
              <p>
                <b>Registered Students:</b>
              </p>
              <ul className="list-disc ml-6">
                {viewPanel.registeredStudents.length === 0
                  ? "None"
                  : viewPanel.registeredStudents.map((stuId) => {
                      const user = allUsers.find((u) => u._id === stuId);
                      return (
                        user && (
                          <li key={stuId}>
                            {user.fullName} ({user.email})
                          </li>
                        )
                      );
                    })}
              </ul>

              <p className="mt-3">
                <b>Slots:</b>
              </p>
              <ul className="list-disc ml-6">
                {viewPanel.slots.length === 0
                  ? "No slots"
                  : viewPanel.slots.map((s) => (
                      <li key={s._id}>
                        {new Date(s.date).toLocaleDateString()} {s.startTime}-
                        {s.endTime} | {s.isBooked ? "Booked" : "Available"}
                      </li>
                    ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
