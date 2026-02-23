const User = require("../schemas/userSchema");
const bcrypt = require("bcryptjs");

// ===============================
// GET - Fetch All Users
// ===============================
exports.getAllUsers = async (req, res) => {
  try {
    const filter = req.departmentId ? { departmentId: req.departmentId } : {};
    const users = await User.find(filter).select("-password").populate("departmentId", "name"); // hide password and populate dept
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// POST - Register New User
// ===============================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, departmentId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Admins dont necessarily need a department, but HOD and Faculty do
    if (role !== "ADMIN" && !departmentId) {
      return res.status(400).json({ message: "Department is required for HOD/Faculty" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      departmentId: role === "ADMIN" ? null : departmentId,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        departmentId: newUser.departmentId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// PUT - Update User Details
// ===============================
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive, departmentId } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name,
        email,
        role,
        isActive,
        departmentId: role === "ADMIN" ? null : departmentId,
      },
      { new: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// PUT - Reset Password
// ===============================
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = password;
    await user.save();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// DELETE - Delete User
// ===============================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
