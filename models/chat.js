const mongoose = require('mongoose');
// const uniqueValidator = require('mongoose-unique-validator');
var moment = require('moment');

const ChatSchema = mongoose.Schema({
	messages : [{sender:{type:String},
	receiver:{type:String},
	message : {type : String},
	status:{type:String,default:'Notseen'},
	time:{type:String,default:moment().format('LLL')}}],
	roomName : {type:String,required:true,unique:true}
});
// UserSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Chats",ChatSchema);