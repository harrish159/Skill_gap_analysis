const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  registerUser,
  updateUser,
  resetPassword,
  deleteUser,
} = require("../controllers/getAllUsersController");

const protect = require('../middleware/authmiddleware');
const authorize = require('../middleware/roleMiddleware');
const restrictToDepartment = require('../middleware/restrictToDepartment');

// GET all users
router.get('/allusers', protect, authorize('admin', 'hod'), restrictToDepartment, getAllUsers);

// POST - Register new user
router.post('/register', protect, authorize('admin'), registerUser);

// PUT - Edit user details
router.put('/users/:id', protect, authorize('admin'), updateUser);

// PUT - Reset password
router.put('/users/:id/password', protect, authorize('admin'), resetPassword);

// DELETE - Delete user
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
