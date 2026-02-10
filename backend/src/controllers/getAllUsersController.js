const User = require("../schemas/userSchema");

// GET all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // fetch all users
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
