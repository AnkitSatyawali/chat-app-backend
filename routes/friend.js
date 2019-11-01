const express = require("express");
const router = express.Router();
const friendHandler = require("../controllers/friend");
const checkAuth = require("../middleware/checkauth");

router.post('/makefriend',friendHandler.make);
router.get('/getFriends',friendHandler.get);
module.exports = router;