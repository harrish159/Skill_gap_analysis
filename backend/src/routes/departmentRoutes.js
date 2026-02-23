const express = require("express");
const router = express.Router();
const {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
} = require("../controllers/DepartmentController");
const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");

// Admin routes
router.post("/", protect, authorize("ADMIN"), createDepartment);
router.get("/", protect, authorize("ADMIN", "HOD"), getAllDepartments);
router.get("/:id", protect, getDepartmentById);

module.exports = router;
