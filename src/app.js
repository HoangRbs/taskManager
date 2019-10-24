
const express = require('express');
const userRouter = require('./Routers/user');
const taskRouter = require('./Routers/task');

const app = express();
require('./db/mongoose')();

app.use(express.json());

app.get('/',(req,res)=>{
    res.send('welcome to my app');
})

app.use(userRouter);
app.use(taskRouter);

module.exports = app;