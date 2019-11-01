const express = require("express");
const router = express.Router();
const roomHandler = require("../controllers/room");
const checkAuth = require("../middleware/checkauth");

router.post('/makeRoom',checkAuth,roomHandler.fetchId);

module.exports = router;