const express = require("express");
const multer = require('multer');
const uuidv4 = require('uuid/v4');
const router = express.Router();
const chatHandler = require("../controllers/chat");
const checkAuth = require("../middleware/checkauth");

const storage = multer.diskStorage({
	destination: function(req,file,cb) {
		console.log(file);
       cb(null,'./files');
	},
	filename: function(req,file,cb) {
		cb(null,uuidv4()+file.originalname.split(" ").join(""));
	}
});
var upload = multer({ storage : storage });

router.post('/sendMessage',checkAuth,chatHandler.send);
router.get('/getMessge/:roomName',checkAuth,chatHandler.getAll);
router.post('/update',checkAuth,chatHandler.update);
router.post('/sendFile',upload.array('files',100),chatHandler.sendFile);
module.exports = router;