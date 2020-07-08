const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const uuidv4 = require('uuid/v4');
const userAuthHandler = require("../controllers/userAuth");
const checkAuth = require("../middleware/checkauth");
const storage = multer.diskStorage({
	destination: function(req,file,cb) {
		console.log(file);
       cb(null,'./profilepics');
	},
	filename: function(req,file,cb) {
		cb(null,uuidv4()+file.originalname.split(" ").join(""));
	}
});
const fileFilter = (req,file,cb) => {
	var ext = path.extname(file.originalname);
	if(ext === '.jpeg' || ext === '.png'){
		cb(null,true);
	}else {
		return cb(null,new Error('Only .jpeg and .png formats are allowed'));
	}
};
const upload = multer({storage:storage,fileFilter:fileFilter});


router.post('/login',userAuthHandler.login);
router.post('/signup',upload.single('image'),userAuthHandler.signup);
router.get('/getId',checkAuth,userAuthHandler.getId);
router.get('/getallusers',checkAuth,userAuthHandler.getAllUsers);
router.post('/make',checkAuth,userAuthHandler.makeFriend);
router.get('/getall',checkAuth,userAuthHandler.getFriends);
router.get('/getloggedUser',checkAuth,userAuthHandler.getData);
// router.post('/updateuserinfo',checkAuth,userAuthHandler.update);
// router.post('/updateuseremail',checkAuth,userAuthHandler.updateEmail);
router.post('/updateusername',checkAuth,userAuthHandler.updateUsername);
router.post('/updateuserimage',checkAuth,upload.single('image'),userAuthHandler.updateImage);
router.post('/updateuserstatus',checkAuth,userAuthHandler.updateStatus);

router.get('/loginupin',userAuthHandler.logupin);
router.get('/signupin',userAuthHandler.signupin);
router.post('/deleteFriend',checkAuth,userAuthHandler.deleteFriend);
module.exports = router;