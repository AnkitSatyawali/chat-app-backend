const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const config = require('./config/database');
const loginRoutes = require('./routes/userAuth');
const roomRoutes = require('./routes/room');
const chatRoutes = require('./routes/chat.js');
// const friendRoutes = require('./routes/friend.js');
const app = express();

mongoose.connect(config.database,{useNewUrlPaser: true})
.then(() => {
	console.log('Connected to database');
},
err => {
	console.log(err);
    console.log('Connection Failed');
});

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use('/profilepics',express.static('profilepics'));
app.use('/files',express.static('files'));
app.use(express.static('files'));app.use((req,res,next) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers",
    	"Origin,X-Requested-With,Content-Type,Accept,Authorization");
    res.setHeader("Access-Control-Allow-Methods",
    	"GET, POST, PATCH, PUT, DELETE, OPTIONS");
    next();
});
app.use('/userAuth',loginRoutes);
app.use('/rooms',roomRoutes);
app.use('/chats',chatRoutes);
// app.use('/friends',friendRoutes);
module.exports = app;