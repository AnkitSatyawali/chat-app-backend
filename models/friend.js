const mongoose = require('mongoose');
// const uniqueValidator = require('mongoose-unique-validator');
var moment = require('moment');

const FriendSchema = mongoose.Schema({
	user:{type:String,required:true},
	friends:[{
    name : {type:String,required:true},
    email : {type:String,required:true,unique:true},
    createdOn : {type:String,default:moment().format('LLL')},
    image : {type:String,default:"https://hsc.unm.edu/community/assets/img/faces/no-image.png"}}]
});
// UserSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Friends",FriendSchema);