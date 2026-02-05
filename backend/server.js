const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const  auth = require("./src/routes/authRoutes")

dotenv.config();

// DB Connection
connectDB();

const app = express();
app.use(express.json());

// Routes
app.use("/api/auth", auth);

app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});