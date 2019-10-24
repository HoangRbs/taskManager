const express = require('express');
const {TaskModel} = require('../models/task');
const auth = require('../middleware/auth');
const Router = express.Router();

Router.post('/task/create',auth,async (req,res) => {
    const taskInfo  = {
        ...req.body,
        owner: req.user._id
    }
    const task = new TaskModel(taskInfo);
    try{
        const data = await task.save();
        res.send(data);
    }
    catch(e){
        res.status(500).send(e + '');
    }
});

//GET /task/show?isCompleted=true
//GET /task/show?limit=2&skip=3
//GET /task/show?sortBy=createdAt:ascend
Router.get('/task/show',auth,async (req,res) => {
    //show tasks of current user
    const match = {};
    const sort = {};
    if(req.query.isCompleted){
        match.isCompleted = req.query.isCompleted==='true';
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        //console.log(parts);
        sort[parts[0]] = parts[1] === 'ascend' ? 1 : -1;
    }
    try{
        await req.user.populate({
            path: 'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort: sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    }
    catch(e){
        res.status(500).send(e + '');
    }
});

Router.get('/task/find/:id',auth,async (req,res) => {
    const _id = req.params.id;

    try{
        const task = await TaskModel.findOne({ _id, owner: req.user._id});
        if(!task)
            res.status(400).send('task not available for current user');
        res.send(task);
    }
    catch(e){
        res.send(e + '');
    }
});

Router.patch('/task/findAndUpdate/:id',auth,async (req,res) => {
    const updateInfo = req.body;
    const updateKeys = Object.keys(updateInfo);
    const allowUpdateKeys = ['description','isCompleted'];
    
    const isValidOperation = updateKeys.every(key => {
        return allowUpdateKeys.includes(key);
    });

    if(!isValidOperation){
        res.status(400).send('invalid update keys');
        return;
    }

    try{
        const task = await TaskModel.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if(!task){
            res.status(404).send('invalid task for current user');
            return;
        }

        updateKeys.forEach( key => {
            task[key] = updateInfo[key];
        });

        task.save();
        
        res.send(task);
    }
    catch(e){
        res.status(400).send(e + '');
    }
});

Router.delete('/task/delete/:id',auth,async (req,res) => {
    try{
        const task = await TaskModel.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });
        
        if(!task){
            res.status(404).send('task not found for current user');
            return;
        }
        res.send(task);
    }
    catch(e){
        res.status(500).send();
    }
});

module.exports = Router;
