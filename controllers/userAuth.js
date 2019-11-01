const User = require("../models/user");
const Room = require("../models/room");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/database");
const fs = require('fs-extra');

const userAuthHandler = {
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
        });
      } else {
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
        console.log(req.body);
        if (!user) {
          return res.send({ message: "Invalid email or password" });
        } else {
          console.log("hello");
          fetchedUser = user;
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
    try {
    let users = await User.find();
    console.log(req.user.userId);
    let user = await User.findOne({_id:req.user.userId});
    
    users = users.map((data)=>{
      console.log(data.id);
      if(data.id!==req.user.userId && !user.friends.some(da=> da.id==data.id))
      return {name:data['name'],email:data['email'],image:data['image'],id:data['_id'],about:data['about']}
   })
   users = users.filter(data => {return data!=null})
      res.status(200).json(users);
    }catch(err){
        res.status(401).json({
          message : "Some error occured"
        })
  }
	},
  makeFriend:(req,res) => {
    User.updateOne({_id:req.user.userId},{$push :{friends : [{
      id : req.body.id,
      name:req.body.name,
      email:req.body.email,
      image:req.body.image,
      about:req.body.about
    }]}}).then(result =>{
         res.status(200).json({
           message:"Added successfully"
         })
    }).catch(err =>{
      res.status(401).json({
        message:"There is an error"
      })
    })
  },
  getFriends: async(req,res) => {
    try {
    let result = await User.findOne({_id:req.user.userId});
    console.log(result);
    let rooms = await Promise.all(result.friends.map(async (resu) => {
       let data = await Room.findOne({$or : [{user2:req.user.userId,user1:resu.id},{user1:req.user.userId,user2:resu.id}]});    
        return data._id;
      
      }))
      console.log();
      res.status(200).json({
        friends : result.friends,
        rooms : rooms
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
  update:async(req,res) => {
    try{
      let user = await User.findOne({_id:req.user.userId});
      let resu = await User.updateOne({_id:req.user.userId},{email:req.body.email,name:req.body.name,about:req.body.about});
      let friends = await Promise.all(user.friends.map(async (data)=>{
        let r = await User.updateOne({_id: data.id,"friends.id":user._id},{$set:{"friends.$.name":req.body.name,"friends.$.email":req.body.email,"friends.$.about":req.body.about}});
        return r;
      }))
      res.status(200).json({
        result: friends
      })
    }
    catch(err)
    {
      res.status(404).json({
        message:err
      })
    }
  },
  updateEmail:async(req,res) => {
    try{
      let user = await User.findOne({_id:req.user.userId});
      let resu = await User.updateOne({_id:req.user.userId},{email:req.body.email});
      let friends = await Promise.all(user.friends.map(async (data)=>{
        let r = await User.updateOne({_id: data.id,"friends.id":user._id},{$set:{"friends.$.email":req.body.email}});
        return r;
      }))
      res.status(200).json({
        message:"Email updated successfully!"
      })
    }
    catch(err)
    {
      res.status(404).json({
        message:"Some error occurs"
      })
    }
  },
   updateUsername:async(req,res) => {
    try{
      let user = await User.findOne({_id:req.user.userId});
      let resu = await User.updateOne({_id:req.user.userId},{name:req.body.name});
      let friends = await Promise.all(user.friends.map(async (data)=>{
        let r = await User.updateOne({_id: data.id,"friends.id":user._id},{$set:{"friends.$.name":req.body.name}});
        return r;
      }))
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
      let friends = await Promise.all(user.friends.map(async (data)=>{
        let r = await User.updateOne({_id: data.id,"friends.id":user._id},{$set:{"friends.$.about":req.body.about}});
        return r;
      }))
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
        let friends = await Promise.all(user.friends.map(async (data)=>{
        let r = await User.updateOne({_id: data.id,"friends.id":user._id},{$set:{"friends.$.image":filepath}});
        return r;
      }))
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