const User = require("../schemas/UserSchema");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user and populate department
    const user = await User.findOne({ email }).populate("departmentId");
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
    const isMatch = password === user.password;
    if (!isMatch) {
      console.log("Password Doesn't Match");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 4. JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        departmentId: user.departmentId?._id || user.departmentId
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // 5. Response
    console.log("--> Login Successful. Sending response for user:", user.email);
    console.log("--> Role being sent:", user.role);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId?._id || user.departmentId,
        departmentName: user.departmentId?.name || "No Department",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
