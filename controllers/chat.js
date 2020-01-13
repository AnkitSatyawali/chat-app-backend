const Chat = require('../models/chat');
const User = require('../models/user');
const fs = require('fs-extra');

const chatHandler = {
    send: async(req,res) => {
    	console.log(req.body)
    	const result = await Chat.findOne({roomName : req.body.roomName});
      const presentUser = await User.findOne({_id:req.user.userId});
    	if(result.messages.length === 0)
      {
        User.updateOne({_id:req.body.receiver},{$push :{friends : [{
            id : presentUser._id,
            name:presentUser.name,
            email:presentUser.email,
            image:presentUser.image,
            about:presentUser.about
          }]}}).then(result =>{
               res.status(200).json({
                 message:"Added successfully"
               })
          }).catch(err =>{
            res.status(401).json({
              message:"There is an error"
            })
          })
      }
      if(!result){
        console.log(result);
    	const chat = new Chat({
    		messages : {
    		sender : req.user.userId,
    		receiver : req.body.receiver,
    	    message : req.body.message,
    	    time : req.body.time,
          isFile : req.body.isFile
    	},
    	roomName : req.body.roomName
    	})
    	chat.save().then(result => {
    		res.status(200).json({
    			message:"Message send successfully",
    			data : result
    		})
    	}).catch(err => {
    		console.log(err);
    		res.status(200).json({
    			message : "There is some error"
    		})
    	})
      }
      else
      {
      	
      	Chat.updateOne({roomName : req.body.roomName},{$push : {messages:[
      		{
      			sender:req.user.userId,
      			receiver : req.body.receiver,
      			message : req.body.message,
      			time : req.body.time,
            isFile : req.body.isFile      		
          }]}}).then(result => {
    		res.status(200).json({
    			message:result
    		})
    	}).catch(err => {
    		console.log(err);
    		res.status(401).json({
    			message : "Having some problem"
    		})
    	})
      }
    },
    getAll : (req,res) => {
    	console.log(req.params.roomName);
    	Chat.findOne({roomName : req.params.roomName}).then(result => {
    		res.status(200).json({
    			data : result.messages
    		})
    	}).catch(err => {
    		res.status(401).json({
    			data : "There is some error"
    		})
    	})
    },
    update: (req,res) => {
      Chat.updateMany({roomName : req.body.roomName,'messages.status':'Notseen'},{$set:{'messages.$[elem].status':'seen'}},{ "arrayFilters": [{ "elem.status": 'Notseen' }], "multi": true }).then(result => {
        res.status(200).json({
          data:result
        })
      }).catch(err =>{
        console.log(err);
        res.status(400).json({
          data:"There is some error"
        })
      })
    },
    sendFile: async(req,res) => {
      let i=0;
      let filesArray=[];
      console.log(req.files);
      for(i=0;i<req.files.length;i++)
      {
        fs.move('./files/' + req.files[i].filename, './files/' + req.body.roomName + '/' + req.files[i].filename);
        filesArray[i] = 'files/'+req.body.roomName+'/'+req.files[i].filename;
      }
      res.status(201).json({
        files:filesArray
      });
    }
}
//5d4966124d2ce926b4849169 AnkitSatyawali
//5d4c17899dd8bf32eac83795
//5d4fc71228643426184ece29
module.exports = chatHandler;