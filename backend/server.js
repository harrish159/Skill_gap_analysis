const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const auth = require("./src/routes/authRoutes");
const skill = require("./src/routes/skillRoutes");
const getAllUserRoutes = require("./src/routes/getAllUserRoutes");
const assessmentRoutes = require("./src/routes/assessmentRoutes");
const cors = require("cors");

dotenv.config();

// DB Connection
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", auth);
app.use("/api", skill);
app.use("/api", getAllUserRoutes);
app.use("/api", require("./src/routes/mappingRoutes"));
app.use("/api/assessments", assessmentRoutes);
app.use("/api/departments", require("./src/routes/departmentRoutes"));
app.use("/api", require("./src/routes/skillgapRoutes"));
app.use("/api", require("./src/routes/recommendationRoutes"));
app.use("/api", require("./src/routes/trainingRoutes"));
app.use("/api/ai", require("./src/routes/aiRoutes"));
app.use("/api", require("./src/routes/approvalRoutes"));

app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
