const Panel = require('../models/panel.model');
const User = require('../models/user.model');
const XLSX = require('xlsx');
const { sendPanelNotificationEmails } = require('../utils/email');
const fs = require('fs');

// Create a new panel
exports.createPanel = async (req, res) => {
    try {
        const { name, description, capacity, slots, registeredStudents, selectAll } = req.body;

        let students = registeredStudents || [];

        if (typeof registeredStudents === "string") {
            try {
                students = JSON.parse(registeredStudents);
            } catch (err) {
                return res.status(400).json({ message: "Invalid registeredStudents format" });
            }
        }

        if (selectAll) {
            const all = await User.find({}, "_id");
            students = all.map((u) => u._id);
        }

        if (req.file) {
            const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet);

            const emails = rows.map((row) => row.Email?.toLowerCase()).filter(Boolean);

            const matched = await User.find({
                email: { $in: emails },
            }).select("_id");

            students = [...new Set([...students, ...matched.map((u) => u._id.toString())])];
        }

        const panel = new Panel({
            name,
            description,
            capacity,
            slots: slots || [],
            registeredStudents: students
        });

        await panel.save();

        res.status(201).json({
            success: true,
            message: "Panel created successfully",
            panel
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get all panels
exports.getPanels = async (req, res) => {
    try {
        const panels = await Panel.find();
        res.json(panels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add a slot to a panel
exports.addSlot = async (req, res) => {
    try {
        const { panelId } = req.params;
        const { date, startTime, endTime, sendEmailNotification } = req.body;

        console.log(`Adding slot to panel ${panelId}:`, { date, startTime, endTime, sendEmailNotification });

        const panel = await Panel.findById(panelId);
        if (!panel) return res.status(404).json({ message: 'Panel not found' });

        const newSlot = { date, startTime, endTime };
        panel.slots.push(newSlot);
        await panel.save();

        let emailResult = null;
        const sendEmails = sendEmailNotification === "true" || sendEmailNotification === true;

        if (sendEmails && panel.registeredStudents.length > 0) {
            try {
                const users = await User.find({ _id: { $in: panel.registeredStudents } }).select('email fullName');
                emailResult = await sendPanelNotificationEmails(panel, users);
            } catch (err) {
                console.error("Email sending failed:", err);
                emailResult = { success: false, error: err.message };
            }
        }

        res.json({
            success: true,
            message: "Slot added successfully",
            panel,
            emailNotification: emailResult
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Register student for a slot
exports.registerSlot = async (req, res) => {
    try {
        const userId = req.user._id;
        const { panelId, slotId } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.status)
            return res.status(403).json({ message: 'Registration not allowed. Please contact admin.' });

        if (user.registeredPanelSlot)
            return res.status(400).json({ message: 'Already registered for a slot.' });

        // Find the panel by panelId
        const panel = await Panel.findById(panelId);
        if (!panel) return res.status(404).json({ message: 'Panel not found' });

        // Find the slot by slotId within the panel
        const slot = panel.slots.id(slotId);
        if (!slot) return res.status(404).json({ message: 'Slot not found in this panel.' });

        if (panel.registeredStudents.length > panel.capacity)
            return res.status(400).json({ message: 'Slot is full.' });

        // Register the student
        user.registeredPanelSlot = slotId;
        user.registeredPanel = panelId;
        slot.isBooked = true;
        user.status = false;

        await panel.save();
        await user.save();

        res.json({ message: 'Registered successfully.' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Student: View eligible slots
exports.getEligibleSlots = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.status) {
            return res.json({
                slots: [],
                registeredSlot: user.registeredPanelSlot,
                status: user.status
            });
        }

        const panels = await Panel.find({ registeredStudents: userId });

        const now = new Date();
        let eligibleSlots = [];

        panels.forEach(panel => {
            panel.slots.forEach(slot => {
                // build Date object with slot.date + slot.endTime
                const slotDateTime = new Date(slot.date);
                const [h, m] = slot.endTime.split(":");
                slotDateTime.setHours(h, m);

                // include only future slots
                if (!slot.isBooked && slotDateTime > now) {
                    eligibleSlots.push({
                        panelId: panel._id,
                        panelName: panel.name,
                        slotId: slot._id,
                        date: slot.date,
                        startTime: slot.startTime,
                        endTime: slot.endTime
                    });
                }
            });
        });

        // sort slots by date + startTime
        eligibleSlots.sort((a, b) => {
            const dateA = new Date(a.date).setHours(...a.startTime.split(":"));
            const dateB = new Date(b.date).setHours(...b.startTime.split(":"));
            return dateA - dateB;
        });

        res.json({
            slots: eligibleSlots,
            registeredSlot: user.registeredPanelSlot,
            status: user.status
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: View slot assignments
exports.getPanelSlots = async (req, res) => {
    try {
        const { panelId } = req.params;
        const panel = await Panel.findById(panelId);
        if (!panel) return res.status(404).json({ message: 'Panel not found' });

        // Find all users registered for this panel
        const users = await User.find({ registeredPanel: panelId }, 'fullName email registeredPanelSlot');

        // For each slot, list assigned students
        const slotAssignments = panel.slots.map(slot => ({
            slotId: slot._id,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBooked: slot.isBooked,
            students: users.filter(u => u.registeredPanelSlot && u.registeredPanelSlot.equals(slot._id))
        }));

        res.json({
            panelId: panel._id,
            panelName: panel.name,
            capacity: panel.capacity,
            registeredCount: users.length,
            slots: slotAssignments
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: Mark interview as completed for a student
exports.markInterviewCompleted = async (req, res) => {
    try {
        const { studentId } = req.params;
        const user = await User.findById(studentId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Find the panel and slot the user was registered to
        if (user.registeredPanel && user.registeredPanelSlot) {
            const panel = await Panel.findById(user.registeredPanel);
            if (panel) {
                // Remove the slot from the panel's slots array
                const slotIndex = panel.slots.findIndex(
                    (s) => s._id.toString() === user.registeredPanelSlot.toString()
                );

                if (slotIndex !== -1) {
                    panel.slots.splice(slotIndex, 1);
                }

                // Delete the slot from the panel's slots array
                panel.slots.id(user.registeredPanelSlot)?.remove();
                await panel.save();
            }
        }

        // Reset registration fields
        user.registeredPanelSlot = null;
        user.registeredPanel = null;
        user.status = true; // Allow re-registration
        await user.save();

        res.json({ message: 'Interview marked as completed. Slot deleted. Student can register again.', user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Student: Get my interview schedule
exports.getMyInterviewSchedule = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // If not registered, return empty schedule
        if (!user.registeredPanel || !user.registeredPanelSlot) {
            return res.json({ schedule: [] });
        }

        // Find the panel and slot
        const panel = await Panel.findById(user.registeredPanel);
        if (!panel) return res.json({ schedule: [] });

        const slot = panel.slots.id(user.registeredPanelSlot);
        if (!slot) return res.json({ schedule: [] });

        // Compose schedule info
        const schedule = [{
            slotId: slot._id,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            panelName: panel.name,
            location: panel.location || undefined,
            interviewer: panel.interviewer || undefined,
            status: slot.isBooked ? "Upcoming" : "Completed"
        }];

        res.json({ schedule });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: Get all slot-to-user mappings
exports.getAllSlotUserMappings = async (req, res) => {
    try {
        // Find all users who are registered to a slot and panel
        const users = await User.find({
            registeredPanel: { $ne: null },
            registeredPanelSlot: { $ne: null }
        }).lean();

        // Get all panels (for slot info)
        const panels = await Panel.find().lean();

        // Build mapping array
        const mappings = users.map(user => {
            const panel = panels.find(p => p._id.toString() === user.registeredPanel?.toString());
            const slot = panel?.slots?.find(s => s._id.toString() === user.registeredPanelSlot?.toString());
            return slot && panel
                ? {
                    _id: user._id,
                    studentId: user._id,
                    studentName: user.fullName,
                    studentEmail: user.email,
                    panelName: panel.name,
                    slotDate: slot.date,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    slotId: slot._id,
                    panelId: panel._id
                }
                : null;
        }).filter(Boolean);

        res.json(mappings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete a panel
exports.deletePanel = async (req, res) => {
    try {
        const { panelId } = req.params;
        const panel = await Panel.findById(panelId);
        if (!panel) return res.status(404).json({ message: "Panel not found" });

        await User.updateMany(
            { registeredPanel: panelId },
            { $set: { registeredPanel: null, registeredPanelSlot: null, status: true } }
        );

        await Panel.findByIdAndDelete(panelId);
        res.json({ message: "Panel deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all panels with future slots only
exports.getPanels = async (req, res) => {
    try {
        const now = new Date();
        let panels = await Panel.find().lean();

        panels.forEach(panel => {
            // remove past slots
            panel.slots = panel.slots.filter(slot => {
                const slotDateTime = new Date(slot.date);
                const [h, m] = slot.endTime.split(":");
                slotDateTime.setHours(h, m);
                return slotDateTime > now;
            });

            // sort slots by date + startTime
            panel.slots.sort((a, b) => {
                const dateA = new Date(a.date).setHours(...a.startTime.split(":"));
                const dateB = new Date(b.date).setHours(...b.startTime.split(":"));
                return dateA - dateB;
            });
        });

        // sort panels by earliest slot date
        panels.sort((a, b) => {
            const firstA = a.slots[0] ? new Date(a.slots[0].date) : new Date(8640000000000000);
            const firstB = b.slots[0] ? new Date(b.slots[0].date) : new Date(8640000000000000);
            return firstA - firstB;
        });

        res.json(panels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/panels/:panelId/slots/:slotId
exports.deleteSlot = async (req, res) => {
    try {
        const { panelId, slotId } = req.params;
        console.log(`Deleting slot ${slotId} from panel ${panelId}`);

        const panel = await Panel.findById(panelId);
        if (!panel) {
            return res.status(404).json({ message: "Panel not found" });
        }

        // Find the slot inside the panel
        const slot = panel.slots.id(slotId);
        if (!slot) {
            return res.status(404).json({ message: "Slot not found" });
        }

        // ✅ Reset users who were registered to this slot
        await User.updateMany(
            { registeredPanel: panelId, registeredPanelSlot: slotId },
            { $set: { registeredPanel: null, registeredPanelSlot: null, status: true } }
        );

        // Remove slot
        slot.deleteOne();
        await panel.save();

        res.status(200).json({ message: "Slot deleted successfully and users reset" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete slot", error: err.message });
    }
};

exports.uploadSlotsFromExcel = async (req, res) => {
    try {
        const { panelId } = req.params;
        const { sendEmailNotification } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
            defval: "", // prevent undefined
        });

        // Normalize keys (strip spaces, case-insensitive)
        const slots = data
            .map((row, idx) => {
                const rawDate = row.Date || row.date || row["DATE"];
                const rawStart = row.StartTime || row.startTime || row["START TIME"];
                const rawEnd = row.EndTime || row.endTime || row["END TIME"];

                if (!rawDate || !rawStart || !rawEnd) {
                    console.warn(`Skipping row ${idx + 2} (missing data)`);
                    return null;
                }

                const [dd, mm, yy] = rawDate.split("-");
                const fullYear = yy.length === 2 ? "20" + yy : yy;
                const formattedDate = new Date(`${fullYear}-${mm}-${dd}`);

                if (isNaN(formattedDate)) return null; // skip invalid dates

                return {
                    date: formattedDate,
                    startTime: rawStart,
                    endTime: rawEnd,
                };
            })
            .filter(Boolean); // remove nulls

        if (slots.length === 0) {
            return res.status(400).json({ message: "No valid slots found in file" });
        }

        const panel = await Panel.findById(panelId);
        if (!panel) return res.status(404).json({ message: "Panel not found" });

        panel.slots.push(...slots);
        await panel.save();

        let emailResult = null;
        const sendEmails = sendEmailNotification === "true" || sendEmailNotification === true;

        if (sendEmails && panel.registeredStudents.length > 0) {
            try {
                const users = await User.find({ _id: { $in: panel.registeredStudents } }).select('email fullName');
                emailResult = await sendPanelNotificationEmails(panel, users);
            } catch (err) {
                console.error("Email sending failed:", err);
                emailResult = { success: false, error: err.message };
            }
        }

        res.json({
            message: "Slots uploaded successfully",
            slots: panel.slots,
            emailNotification: emailResult,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Add users to a panel
exports.addUsersToPanel = async (req, res) => {
    try {
        const { panelId } = req.params;
        const { userIds, sendEmail } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: "userIds must be a non-empty array" });
        }

        const panel = await Panel.findById(panelId);
        if (!panel) return res.status(404).json({ message: "Panel not found" });

        // Merge unique user IDs
        const updatedStudents = [
            ...new Set([
                ...panel.registeredStudents.map(id => id.toString()),
                ...userIds.map(id => id.toString())
            ])
        ];

        panel.registeredStudents = updatedStudents;
        await panel.save();

        let emailResult = null;

        // ✅ Send notification emails if requested
        if (sendEmail) {
            try {
                const users = await User.find({ _id: { $in: userIds } }).select("email fullName");
                if (users.length > 0) {
                    emailResult = await sendPanelNotificationEmails(panel, users);
                }
            } catch (err) {
                console.error("Email sending failed:", err);
                emailResult = { success: false, error: err.message };
            }
        }

        res.json({
            message: "Users added successfully to panel",
            panel,
            emailNotification: emailResult
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to add users", error: err.message });
    }
};

// Remove a single user from a panel
exports.removeUserFromPanel = async (req, res) => {
    try {
        const { panelId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const panel = await Panel.findById(panelId);
        if (!panel) return res.status(404).json({ message: "Panel not found" });

        // Remove the user from registeredStudents
        panel.registeredStudents = panel.registeredStudents.filter(
            id => id.toString() !== userId.toString()
        );

        await panel.save();

        // Reset the user’s registration if they were registered to this panel
        await User.findByIdAndUpdate(userId, {
            $set: {
                registeredPanel: null,
                registeredPanelSlot: null,
                status: true
            }
        });

        res.json({
            message: "User removed successfully from panel",
            panel
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to remove user", error: err.message });
    }
};
