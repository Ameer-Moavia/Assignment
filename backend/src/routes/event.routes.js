const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');
const {
  createEvent, updateEvent, deleteEvent,
  listEvents, getEvent, joinEvent,
  approveParticipant, listParticipants
} = require('../controllers/event.controller');

// public
router.get('/', listEvents);
router.get('/:id', getEvent);

// admin
router.post('/', requireAuth, requireRole('ADMIN'), createEvent);
router.patch('/:id', requireAuth, requireRole('ADMIN'), updateEvent);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteEvent);
router.get('/:id/participants', requireAuth, requireRole('ADMIN'), listParticipants);
router.post('/:id/participants/:pid/approve', requireAuth, requireRole('ADMIN'), approveParticipant);

// participant
router.post('/:id/join', requireAuth, joinEvent);

module.exports = router;
