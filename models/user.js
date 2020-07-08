const mongoose = require('mongoose');
// const uniqueValidator = require('mongoose-unique-validator');
var moment = require('moment');

const UserSchema = mongoose.Schema({
    name : {type:String,required:true},
    // password : {type:String,required:true},
    about : {type:String,default:"Hey! i am using gitforker"},
    background :{type:String},
    email : {type:String,required:true,unique:true},
    createdOn : {type:String,default:moment().format('LLL')},
    image : {type:String,default:"https://hsc.unm.edu/community/assets/img/faces/no-image.png"},
    friends : [{
       id : {type:String,required:true},
    roomName:{type:String,required:true}}]
});
// UserSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Users",UserSchema);