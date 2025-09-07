const Panel = require('../models/panel.model');
const User = require('../models/user.model');

// Create a new panel
exports.createPanel = async (req, res) => {
    try {
        const { name, slots } = req.body;
        const panel = new Panel({ name, slots: slots || [] });
        await panel.save();
        res.status(201).json(panel);
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
        const { date, startTime, endTime, capacity } = req.body;
        const panel = await Panel.findById(panelId);
        if (!panel) return res.status(404).json({ message: 'Panel not found' });

        panel.slots.push({ date, startTime, endTime, capacity, registeredStudents: [] });
        await panel.save();
        res.json(panel);
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

        if (!user.canRegisterAgain)
            return res.status(403).json({ message: 'Registration not allowed. Please contact admin.' });

        if (user.registeredPanelSlot)
            return res.status(400).json({ message: 'Already registered for a slot.' });

        // Find the panel by panelId
        const panel = await Panel.findById(panelId);
        if (!panel) return res.status(404).json({ message: 'Panel not found' });

        // Find the slot by slotId within the panel
        const slot = panel.slots.id(slotId);
        if (!slot) return res.status(404).json({ message: 'Slot not found in this panel.' });

        if (slot.registeredStudents.length >= slot.capacity)
            return res.status(400).json({ message: 'Slot is full.' });

        // Register the student
        slot.registeredStudents.push(userId);
        user.registeredPanelSlot = slotId;
        user.canRegisterAgain = false;

        await panel.save();
        await user.save();

        res.json({ message: 'Registered successfully.' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get eligible slots for a student
exports.getEligibleSlots = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const panels = await Panel.find();
        let eligibleSlots = [];
        panels.forEach(panel => {
            panel.slots.forEach(slot => {
                if (slot.registeredStudents.length < slot.capacity) {
                    eligibleSlots.push({
                        panelId: panel._id,
                        slotId: slot._id,
                        date: slot.date,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        filled: slot.registeredStudents.length,
                        capacity: slot.capacity
                    });
                }
            });
        });

        res.json({
            slots: eligibleSlots,
            registeredSlot: user.registeredPanelSlot,
            canRegister: user.canRegisterAgain
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: View slot assignments
exports.getPanelSlots = async (req, res) => {
    try {
        const { panelId } = req.params;
        const panel = await Panel.findById(panelId).populate('slots.registeredStudents', 'name email');
        if (!panel) return res.status(404).json({ message: 'Panel not found' });
        res.json(panel);
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

        // Reset registration flag and slot
        user.canRegisterAgain = true;
        user.registeredPanelSlot = null;
        await user.save();

        res.json({ message: 'Interview marked as completed. Student can register again.', user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};