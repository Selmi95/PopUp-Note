const express = require('express');
const router = express.Router();
const { getUsers, toggleUserStatus, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin')); // All admin routes require admin role

router.get('/users', getUsers);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

module.exports = router;
