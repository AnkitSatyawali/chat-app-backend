const Chat = require('../models/chat');

const chatHandler = {
    send: async(req,res) => {
    	console.log(req.body)
    	const result = await Chat.findOne({roomName : req.body.roomName});
    	if(!result){
    	const chat = new Chat({
    		messages : {
    		sender : req.user.userId,
    		receiver : req.body.receiver,
    	    message : req.body.message,
    	    time : req.body.time
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
      			time : req.body.time
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
    }
}
//5d4966124d2ce926b4849169 AnkitSatyawali
//5d4c17899dd8bf32eac83795
//5d4fc71228643426184ece29
module.exports = chatHandler;