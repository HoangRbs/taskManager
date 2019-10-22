const express = require('express');
const {UserModel} = require('../models/user');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const {sendWelcomeEmail} = require('../emails/account');

const Router = express.Router();

/*
Router.get('/user/show',async (req,res) => {
    const users = await UserModel.find();
    res.send(users);
})
*/

Router.post('/user/create',async (req,res) => {
    const userInfo = req.body;
    const user = new UserModel(userInfo);
    user.password = await bcrypt.hash(user.password,8);
    try{
        const data = await user.save();
        const token = await user.generateAuthToken();
        sendWelcomeEmail(user.email,user.name);
        res.send({data,token});
    }
    catch(e){
        res.send(e);
    }
});

Router.post('/user/login',async (req,res) => {
    try{
        const user = await UserModel.findByCredentials(req.body.email,req.body.password);
        if(!user)
            throw new Error('unable to loggin');
        
        const token = await user.generateAuthToken();
        res.send({user,token});
    }
    catch(e){
        res.status(400).send(e + '');
    }
});

Router.get('/user/myinfo',auth,async (req,res) => {
    const user = req.user;
    res.send(user);
})

//have to login to have authorize (token) to logout
Router.post('/user/logout',auth,async (req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter(tokenObj =>{
            return tokenObj.token !== req.token;
        });
    
        await req.user.save();

        res.send();
    }
    catch(e){
        res.status(500).send(e + '');
    }
});

Router.post('/user/logoutAll',auth,async (req,res) =>{
    try{
        req.user.tokens = [];
        await req.user.save();
        res.send();
    }
    catch(e){
        res.status(500).send();
    }
});

Router.patch('/user/update/me',auth,async (req,res) => {
    const updateInfo = req.body;
    const updateKeys = Object.keys(updateInfo);
    const allowUpdateKey = ['name','email','password','age'];
    const isValidOperation = updateKeys.every(key => {
        return allowUpdateKey.includes(key);
    });  

    if(!isValidOperation){
        res.status(400).send('invalid updates');
        return;
    }

    try{ 
        const user = req.user;

        updateKeys.forEach( key => {
            user[key] = updateInfo[key];
        });

        if(updateInfo['password']){  
            user.password = await bcrypt.hash(user.password,8);
        }

        await user.save();

        res.send(user);
    }   
    catch(e){
        res.status(400).send(e);
    }
});

Router.delete('/user/delete/me',auth,async (req,res) => {
    try{
        await req.user.remove();
        res.send(req.user);
    }
    catch(e){
        res.status(500).send(e + '');
    }
});

const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
            return cb(new Error('pls upload image file'),false);
        cb(null,true);
    }
});

Router.post('/user/me/avatar',auth,upload.single('avatar') , async(req,res) => {
    const buffer = await sharp(req.file.buffer).resize(250,250).png().toBuffer();
    req.user.avatar = buffer;
    
    await req.user.save();
    res.send();
},(err,req,res,next) => {
    res.status(400).send(err.message);
})

Router.delete('/user/me/avatar',auth, async(req,res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
})

Router.get('/user/:id/avatar',async (req,res) => {
    try{
        const user = await UserModel.findById(req.params.id);
        if(!user || !user.avatar)
            throw new Error('no user or no avatar');
        res.set('Content-Type','image/png');
        res.send(user.avatar);
    }
    catch(e){
        res.status(400).send(e + '');
    }
})


module.exports = Router;