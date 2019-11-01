const mongoose = require('mongoose');
// const uniqueValidator = require('mongoose-unique-validator');
var moment = require('moment');

const RoomSchema = mongoose.Schema({
	user1 : {type:String,required:true},
	user2 : {type:String,required:true}	
});
// UserSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Rooms",RoomSchema);