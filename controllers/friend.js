const Friend = require("../models/friend");

const friendHandler = {
    make: (req,res) => {
    	
    },
    get: (req,res) => {
       res.status(200).json({
    		message:"Connected"
    	})
    }
}
module.exports = friendHandler;