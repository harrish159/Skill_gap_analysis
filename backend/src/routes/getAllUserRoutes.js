const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  registerUser,
  updateUser,
  resetPassword,
  deleteUser,
} = require("../controllers/getAllUsersController");

// GET all users
router.get("/allusers", getAllUsers);

// POST - Register new user
router.post("/register", registerUser);

// PUT - Edit user details
router.put("/users/:id", updateUser);

// PUT - Reset password
router.put("/users/:id/password", resetPassword);

// DELETE - Delete user
router.delete("/users/:id", deleteUser);

module.exports = router;
