const express = require('express');
const router = express.Router();
const panelController = require('../controllers/panel.controller');
const { protect, admin } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

// Admin routes
router.post('/', protect, admin, upload.single("file"), panelController.createPanel);
router.get('/', protect, admin, panelController.getPanels);
router.post('/:panelId/slots', protect, admin, panelController.addSlot);
router.get('/:panelId/slots', protect, admin, panelController.getPanelSlots);
router.get('/slot-user-mappings', protect, admin, panelController.getAllSlotUserMappings);
router.put('/slots/students/:studentId/interview-completed', protect, admin, panelController.markInterviewCompleted);
router.delete("/:panelId", protect, admin, panelController.deletePanel);
router.delete("/:panelId/slots/:slotId", protect, admin, panelController.deleteSlot);
router.post('/:panelId/slots/upload-excel', protect, admin, upload.single("file"), panelController.uploadSlotsFromExcel);
router.put("/:panelId/add-users", protect, admin, panelController.addUsersToPanel);
router.put("/:panelId/remove-user", protect, admin, panelController.removeUserFromPanel);

// Student routes
router.get('/eligible-slots', protect, panelController.getEligibleSlots);
router.post('/register', protect, panelController.registerSlot);
router.get('/my-interview-schedule', protect, panelController.getMyInterviewSchedule);

module.exports = router;