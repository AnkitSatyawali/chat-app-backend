const express = require("express");
const router = express.Router();
const roomHandler = require("../controllers/room");
const checkAuth = require("../middleware/checkauth");

router.post('/makeRoom',checkAuth,roomHandler.fetchId);
router.get('/checking',(req,res,next) => {
	res.status(200).json({
		message:"checked successfully"
	})
})
module.exports = router;