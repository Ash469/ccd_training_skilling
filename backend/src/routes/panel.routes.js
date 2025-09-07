const express = require('express');
const router = express.Router();
const panelController = require('../controllers/panel.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// Admin routes
router.post('/', protect, admin, panelController.createPanel);
router.get('/', protect, admin, panelController.getPanels);
router.post('/:panelId/slots', protect, admin, panelController.addSlot);
router.get('/:panelId/slots', protect, admin, panelController.getPanelSlots);
router.put('/students/:studentId/interview-completed', protect, admin, panelController.markInterviewCompleted);

// Student routes
router.get('/eligible-slots', protect, panelController.getEligibleSlots);
router.post('/register', protect, panelController.registerSlot);

module.exports = router;