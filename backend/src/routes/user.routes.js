const express = require('express');
const router = express.Router();
const { listUsers, updateRole } = require('../controllers/user.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

router.get('/', requireAuth, requireRole('ADMIN'), listUsers);
router.patch('/:id/role', requireAuth, requireRole('ADMIN'), updateRole);

module.exports = router;
