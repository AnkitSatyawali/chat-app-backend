const Chat = require('../models/room');
const User = require('../models/user');
const fs = require('fs-extra');

const chatHandler = {
    send: async(req,res) => {
    	console.log(req.body)
    	const result = await Chat.findOne({_id : req.body.roomName});
      const presentUser = await User.findOne({_id:req.user.userId});
    	if(result.updatedBy===req.user.userId && result.messages.length === 0)
      { 
        await User.updateOne({_id:req.body.receiver},{$push :{friends : [{
            id : presentUser._id,
            roomName:req.body.roomName
          }]}})
      }
    	const chat = {
    		sender : req.user.userId,
    		receiver : req.body.receiver,
    	    message : req.body.message,
    	    time : req.body.time,
          isFile : req.body.isFile,
          timeStamp: req.body.timeStamp
      }
      var d =new Date();
      Chat.updateOne({_id:req.body.roomName},
        {$push :{messages : [{
          sender : req.user.userId,
          receiver : req.body.receiver,
            message : req.body.message,
            time : req.body.time,
            isFile : req.body.isFile,
            timeStamp:req.body.timeStamp
        }]},
        $set:{updatedBy:req.user.userId,state: 1,timeStamp:(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()))}}).then(result => {
          console.log(result);
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
    },
    getAll : (req,res) => {
      var token = req.params.roomName;
      var resp = token.split("&&");
    	console.log(token);
      let skp = -1*20*resp[1];
      console.log(resp[2])
    	Chat.findOne({_id: resp[0]},{messages: {$slice:[skp,20]}}).then(result => {
        // console.log(result);
        if(resp[2])
        {
          let i;
          for(i=result.messages.length-1;i>=0;i--)
          {
            console.log('pp')
            if(result.messages[i].timeStamp.getTime()>=new Date(resp[2]).getTime())
              result.messages.pop();
          }
        }
    		res.status(200).json({
    			data : result.messages
    		})
    	}).catch(err => {
        console.log(err);
    		res.status(401).json({
    			data : "There is some error"
    		})
    	})
    },
    update: (req,res) => {
      Chat.findOne({_id:req.body.roomName}).then(result => {
        if(req.user.userId!=result.updatedBy)
          {
            Chat.updateOne({_id : req.body.roomName},{$set:{updatedBy:req.user.userId,state:0}}).then(result => {
              res.status(200).json({
                data:result
              })
            }).catch(err =>{
              console.log(err);
              res.status(400).json({
                data:"There is some error"
              })
            })
          }
          else{
            res.status(200).json({
              data:"No need to update"
            })
          }
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