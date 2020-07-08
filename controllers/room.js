const Room = require('../models/room');
// const Chat = require('../models/chat');

const roomHandler = {

	// create : async(req,res) => {
	// 	console.log(req.body);
	// 	res.status(200).json({
	// 		data : req.body
	// 	})
	// }
	fetchId : async(req,res) => {
		console.log(req.body);
		console.log(req.user.userId);
		const user1 = req.body.user1;
        const user2 = req.user.userId;
		Room.findOne({$or : [{user2:user2,user1:user1},{user1:user2,user2:user1}]}).then(result => {
			if(result)
			{
				res.status(200).json({data : result});
				console.log("found")
			}
			else
			{
				var d = new Date();
				const newRoom = new Room({
					user1 : user1,
					user2 : user2,
					timeStamp: (new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds())),
					updatedBy: req.user.userId
				})
				console.log(newRoom);
				newRoom.save().then(result => {
					// const chat = new Chat({
					// roomName : result._id
					// });
				    // chat.save().then(result => {
				    // 	res.status(200).json({
				    // 		message:"chat created"
				    // 	})
				    // 	}).catch((err)=>{
                    //        console.log(err);
				    // 	})
				    
					res.status(200).json({
						data : result
					})
				})
				.catch(err => {
					res.status(401).json({
						data : "Something went wrong"
					})
				})


			}
		})
		.catch(err => {
			res.status(400).json({err : err});
		})
	}

}
module.exports = roomHandler;