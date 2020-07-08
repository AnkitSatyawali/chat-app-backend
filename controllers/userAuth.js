const User = require("../models/user");
const Room = require("../models/room");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const config = require("../config/database");
const fs = require('fs-extra');
const axios = require('axios');
const userAuthHandler = {
  signupin:(req,res,next) =>{
    console.log("gotit");
    let sc= "user:email";
    res.status(200).redirect(`https://github.com/login/oauth/authorize?client_id=${config.clientID}&scope=${sc}`);
  },
  logupin: async (req,res) =>{
    const body = {
      client_id: config.clientID,
      client_secret: config.clientSecret,
      code: req.query.code
    };
    
    const opts = { headers: { accept: 'application/json' } };
    axios.post(`https://github.com/login/oauth/access_token`,body,opts).then((response) => {
      // console.log(response.data.access_token);
      axios.get(`https://api.github.com/user/emails`,{headers:{Authorization:'token '+response.data.access_token}}).then((respo) =>{
      axios.get(`https://api.github.com/user`,{headers:{Authorization:'token '+response.data.access_token}}).then(data => {
        console.log(data);
        let email=respo.data[0].email;      
        User.findOne({email}).then(result => {
        if(!result)
        {
          newUser = new User({
            name: data.data.login,
            email: email,
            image:data.data.avatar_url,
            status:data.data.bio
          })
          newUser.save().then(result => {
            const token = jwt.sign(
              {
                username: result.email,
                userId: result._id 
              },
              config.JWT_KEY,
              { expiresIn: "2400h" }
            );
            console.log({
              token: token,
              githubToken:response.data.access_token,
              expiresIn: "2400h",
              userId: result._id,
              user:result,
              message:"User Signup successfully"
            });
          //   res.cookie('token',token);
          // res.cookie('githubToken',response.data.access_token);
          res.status(200).redirect(`https://gitforkerapp.herokuapp.com/loggingIn/${token+" "+response.data.access_token}`)
            res.status(200).json({
              token: token,
              githubToken:response.data.access_token,
              expiresIn: "2400h",
              userId: result._id,
              user:result,
              message:"User Signup successfully"
            });
            // console.log(token);
          })
          .catch(err => {
            console.log(err)
            res.status(500).json({
              message: "User signup failed"
            });
          });
        }
        else
        {
          console.log("Login");
          console.log(result);
          const token = jwt.sign(
            {
              username: result.email,
              userId: result._id 
            },
            config.JWT_KEY,
            { expiresIn: "2400h" }
          );
          // res.cookie('token',token);
          // res.cookie('githubToken',response.data.access_token);
           res.status(200).redirect(`https://gitforkerapp.herokuapp.com/loggingIn/${token+" "+response.data.access_token}`)
          
          // res.status(200).json({
          //   token: token,
          //   githubToken:response.data.access_token,
          //   expiresIn: "2400h",
          //   userId: result._id,
          //   user:result,
          //   message:"Logged in successfully"
          // });
          // console.log(token);
        }
      })
      .catch(err => {
        res.status(401).json({
          message:'There is some problem on our side. Sorry for inconvenience'
        })
      })
      }).catch((err)=>{
        console.log(err);
        res.json({
          err:err
        })
      })
    }).catch((err) =>{ 
        console.log(err);
    })
  }).catch(err => {
    console.log(err);
   })
 },



	signup: (req, res, next) => {
    const {name,email,password} = req.body
    User.findOne({email}).then(result => {
      console.log(result);
      let newuser;
      if (!result) {
        bcrypt.hash(req.body.password, 10).then(hash => {
          if(req.file){
          const url = req.protocol + "://" + req.get("host");
          imagePath = url + "/profilepics/" + req.file.filename;
          newUser = new User({
          	name: req.body.name,
            email: req.body.email,
            password: hash,
            image : imagePath
          })
         }
         else{
         	
         	newUser = new User({
          	name: req.body.name,
            email: req.body.email,
            password: hash
          })
        }
        console.log(newUser);
        newUser.save().then(result => {
              res.status(201).json({
                message: "User signup successfully"
              });
            })
            .catch(err => {
              console.log(err)
              res.status(500).json({
                message: "User signup failed"
              });
            });
        }).catch(err =>{
        	console.log(err);
        	res.status(400).json({
        		message:"Unknown error occured"
        	});
        });      } else {
        res
          .status(401)
          .json({ message: "User with this email id and name already exists" });
      }
    });
  },
  login: (req, res) => {
    let fetchedUser;
    return User.findOne({ email: req.body.email })
      .then(user => {
        console.log(user);
        if (!user) {
          return res.send({ message: "Invalid email or password" });
        } else {
          console.log("hello");
          fetchedUser = user;
          console.log(user.password);
          return bcrypt.compare(req.body.password, user.password);
        }
      })
      .then(result => {
        console.log(result);
        if (!result) {
          return res.status(201).json({ message: "Wrong Credentials" });
        } else {
          const token = jwt.sign(
            {
              username: fetchedUser.name,
              userId: fetchedUser._id 
            },
            config.JWT_KEY,
            { expiresIn: "2400h" }
          );
          res.status(200).json({
            token: token,
            expiresIn: "2400h",
            userId: fetchedUser._id,
            user:fetchedUser,
            message:"Logged in successfully"
          });
          console.log(token);
        }
      })
      .catch(err => {
        console.log(err);
        return res.status(401).json({
          message: "Invalid details"
        });
      });
  },
  getId:(req,res) => {
    return res.status(200).json({
      name: req.user.userId
    });
  },
  getAllUsers:async(req,res) => {
    console.log(req.query.name);
    if(req.query.name=="")
    res.status(200).json({
      len:0
    })
    var regex = new RegExp(req.query.name,'i');
    let user = await User.findOne({_id:req.user.userId});
    User.find({name:regex}).limit(15).then((resp) => {
      console.log(resp);
      if(resp && resp.length>0)
      {   
        users = [];
        resp.forEach((data)=>{ 
          console.log(data.id);
          if(data._id!=req.user.userId && !user.friends.some(da=> da.id==data.id))
          users.push({name:data.name,email:data.email,image:data.image,id:data._id,about:data.about})
       })  
      console.log(users);
       res.status(200).json({
         users:users,
         len:users.length 
       })
      }  
      else{ 
        res.status(200).json({
          len:0
        })
      }
    }).catch(err => {
      res.status(401).json({
        message:"There is an error"
      })
    });
    
  //   try {
  //   let users = await User.find();
  //   console.log(req.user.userId);
  //   let user = await User.findOne({_id:req.user.userId});
    
  //   users = users.map((data)=>{
  //     console.log(data.id);
  //     if(data.id!==req.user.userId && !user.friends.some(da=> da.id==data.id))
  //     return {name:data['name'],email:data['email'],image:data['image'],id:data['_id'],about:data['about']}
  //  })
  //  users = users.filter(data => {return data!=null})
  //     res.status(200).json(users);
  //   }catch(err){
  //       res.status(401).json({
  //         message : "Some error occured"
  //       })
  // }
	},
  makeFriend:(req,res) => {
    User.updateOne({_id:req.user.userId},{$push :{friends : [{
      id : req.body.id,
      roomName:req.body.roomName
    }]}}).then(result =>{
        //  User.findOne({_id:req.user.userId}).then(user => {
        //    let userData = user;
          //  User.updateOne({_id:req.body.id},{$push :{friends : [{
          //   id : req.user.userId,
          // }]}}).then(result => {
          //   console.log(result);
          // })
        //  })
         res.status(200).json({
           message:"Added successfully"
         })
    }).catch(err =>{
      res.status(401).json({
        message:"There is an error"
      })
    })
  },
  deleteFriend:async(req,res) => {
    User.updateOne({_id:req.user.userId},{$pull:{friends : {id: req.body.id}}}).then(result=>{
      res.status(200).json({message:'Deleted Successfully'});
    }).catch(err =>{
      res.status(401).json({
        message:'There is an error'
      })
    })
  },
  getFriends: async(req,res) => {
    try {
    let result = await User.findOne({_id:req.user.userId});
    console.log(result);
    let rooms = await Promise.all(result.friends.map(async (resu) => {
       return resu.roomName;
      }))
    let timeStamps = await Promise.all(rooms.map(async (room)=>{
      let roomDetail = await Room.findOne({_id:room});
      return {timeStamp:roomDetail.timeStamp,updatedBy:roomDetail.updatedBy,state:roomDetail.state};
    }))
    let friends = await Promise.all(result.friends.map(async (resu) => {
      let friend = await User.findOne({_id:resu.id});
        return ({id:friend._id,about:friend.about,name:friend.name,image:friend.image});
    }))
      console.log(friends);
    friendsDetails = [];
    var i;
    for(i=0;i<rooms.length;i++)
    {
      friendDetail = {
        room : rooms[i],
        friend : friends[i], 
        timeStamp : timeStamps[i].timeStamp,
        updatedBy : timeStamps[i].updatedBy,
        state : timeStamps[i].state
      }
      friendsDetails.push(friendDetail);
    }
    friendsDetails.sort(function(x,y){
      return x.timeStamp-y.timeStamp;
    })
    friends.splice(0,friends.length);
    rooms.splice(0,rooms.length);
    roomNotification=[];
    console.log(friendsDetails);
    console.log("oioii");
    for(i=friendsDetails.length-1;i>=0;i--)
    {
      friends.push(friendsDetails[i].friend);
      rooms.push(friendsDetails[i].room);
      roomNotification.push({updatedBy:friendsDetails[i].updatedBy,state:friendsDetails[i].state})
    }
      res.status(200).json({
        friends : friends, 
        rooms : rooms,
        roomNotification : roomNotification
      })
    } 
    catch(err){
      res.status(200).json({
        message:"There is an erro"
      })
    }
  },
  getData: (req,res) => {
      User.findOne({_id:req.user.userId}).then(result => {
         res.status(200).json({
           result
         })
      })
  },
  // update:async(req,res) => {
  //   try{
  //     let user = await User.findOne({_id:req.user.userId});
  //     let resu = await User.updateOne({_id:req.user.userId},{email:req.body.email,name:req.body.name,about:req.body.about});
  //     let friends = await Promise.all(user.friends.map(async (data)=>{
  //       let r = await User.updateOne({_id: data.id,"friends.id":user._id},{$set:{"friends.$.name":req.body.name,"friends.$.email":req.body.email,"friends.$.about":req.body.about}});
  //       return r;
  //     }))
  //     res.status(200).json({
  //       result: friends
  //     })
  //   }
  //   catch(err)
  //   {
  //     res.status(404).json({
  //       message:err
  //     })
  //   }
  // },
  // updateEmail:async(req,res) => {
  //   try{
  //     let user = await User.findOne({_id:req.user.userId});
  //     let resu = await User.updateOne({_id:req.user.userId},{email:req.body.email});
  //     let friends = await Promise.all(user.friends.map(async (data)=>{
  //       let r = await User.updateOne({_id: data.id,"friends.id":user._id},{$set:{"friends.$.email":req.body.email}});
  //       return r;
  //     }))
  //     res.status(200).json({
  //       message:"Email updated successfully!"
  //     })
  //   }
  //   catch(err)
  //   {
  //     res.status(404).json({
  //       message:"Some error occurs"
  //     })
  //   }
  // },
   updateUsername:async(req,res) => {
    try{
      let user = await User.findOne({_id:req.user.userId});
      let resu = await User.updateOne({_id:req.user.userId},{name:req.body.name});
      // let friends = await Promise.all(user.friends.map(async (data)=>{
      //   let r = await User.updateOne({_id: data.id,"friends.id":user._id},{$set:{"friends.$.name":req.body.name}});
      //   return r;
      // }))
      res.status(200).json({
        message:"Username updated successfully!"
      })
    }
    catch(err)
    {
      res.status(404).json({
        message:"Some error occurs"
      })
    }
  },
   updateStatus:async(req,res) => {
    try{
      let user = await User.findOne({_id:req.user.userId});
      let resu = await User.updateOne({_id:req.user.userId},{about:req.body.about});
      // let friends = await Promise.all(user.friends.map(async (data)=>{
      //   let r = await User.updateOne({_id: data.id,"friends.id":user._id},{$set:{"friends.$.about":req.body.about}});
      //   return r;
      // }))
      res.status(200).json({
         message:"Status updated successfully!"
      })
    }
    catch(err)
    {
      res.status(404).json({
        message:"Some error occurs"
      })
    }
  },
   updateImage:async(req,res) => {
     console.log(req.file);
     console.log(req.user.userId);
     try{
     const filepath = 'profilepics/'+ req.user.userId+'/'+req.file.filename;
     fs.move('./profilepics/' + req.file.filename, './profilepics/' + req.user.userId + '/' + req.file.filename);
     let user = await User.findOne({_id:req.user.userId});
        let resu = await User.updateOne({_id:req.user.userId},{image:filepath});
      //   let friends = await Promise.all(user.friends.map(async (data)=>{
      //   let r = await User.updateOne({_id: data.id,"friends.id":user._id},{$set:{"friends.$.image":filepath}});
      //   return r;
      // }))
      res.status(201).json({
        message:"Image updated successfully!"
      }) 
   }
     catch(err) {
       console.log(err);
       res.status(426).json({
         message:"Some error occurs"
       })
     }
    // try{
    //   let user = await User.findOne({_id:req.user.userId});
    //   let resu = await User.updateOne({_id:req.user.userId},{image:req.file});
    //   let friends = await Promise.all(user.friends.map(async (data)=>{
    //     let r = await User.updateOne({_id: data.id,"friends.id":user._id},{$set:{"friends.$.email":req.body.email}});
    //     return r;
    //   }))
    //   res.status(200).json({
    //     result: friends
    //   })
    // }
    // catch(err)
    // {
    //   res.status(404).json({
    //     message:err
    //   })
    // }
  }
}

module.exports = userAuthHandler;