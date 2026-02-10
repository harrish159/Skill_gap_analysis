const express = require("express");
const router = express.Router();
const { getAllUsers } = require("../controllers/getAllUsersController");

router.get("/allusers", getAllUsers);

module.exports = router;
