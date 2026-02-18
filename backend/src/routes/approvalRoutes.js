const express = require("express");
const router = express.Router();

const approvalController = require("../controllers/approvalController.js");
const {
  createApprovalRequest,
  GetAllRequests,
  getPendingRequestsForHOD,
  updateApprovalRequest,
} = approvalController;

const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");

// Path: POST /api/approval (Faculty only)
router.post("/approval", protect, authorize("faculty"), createApprovalRequest);

// Path: GET /api/approval (HOD/Admin only)
router.get("/approval", protect, authorize("hod", "admin"), GetAllRequests);

// Path: GET /api/approval/pending (HOD/Admin only)
router.get("/approval/pending", protect, authorize("hod", "admin"), getPendingRequestsForHOD);

// Path: PUT /api/approval/:requestId (HOD/Admin only)
router.put("/approval/:requestId", protect, authorize("hod", "admin"), updateApprovalRequest);

module.exports = router;