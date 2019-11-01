const express = require("express");
const router = express.Router();
const chatHandler = require("../controllers/chat");
const checkAuth = require("../middleware/checkauth");

router.post('/sendMessage',checkAuth,chatHandler.send);
router.get('/getMessge/:roomName',checkAuth,chatHandler.getAll);
router.post('/update',checkAuth,chatHandler.update);
module.exports = router;