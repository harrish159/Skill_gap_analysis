const User = require("../schemas/userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User Not Found");
      return res.status(400).json({ message: "User not found" });
    }

    // 2. Active check
    if (!user.isActive) {
      console.log("Not Active Account")
      return res.status(403).json({ message: "Account deactivated" });
    }

    // 3. Password check
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   console.log("Password Doesn't Match");
    //   return res.status(400).json({ message: "Invalid password" });
    // }

    // 4. JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // 5. Response
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
