const mongoose = require('mongoose');
// const uniqueValidator = require('mongoose-unique-validator');
var moment = require('moment');

const RoomSchema = mongoose.Schema({
	user1 : {type:String,required:true},
	user2 : {type:String,required:true},
	timeStamp:{type:Date,required:true},
	updatedBy : {type:String,required:true},
	state : {type:Number,default:0},
	messages : [{sender:{type:String},
		receiver:{type:String},
		message : {type : String},
		status:{type:String,default:'Notseen'},
		isFile:{type:Boolean,required:true},
		time:{type:String,default:moment().format('LLL')},
		timeStamp:{type:Date,required:true}}]
});
// UserSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Rooms",RoomSchema);