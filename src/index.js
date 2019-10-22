const express = require('express');
const userRouter = require('./Routers/user');
const taskRouter = require('./Routers/task');

const app = express();
require('./db/mongoose');

//middleware
/*
app.use((req,res,next) => {
    if(req.method == 'GET'){
        res.send('get req is disabled');
    }else{
        next();
    }
});
*/

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

const port = process.env.PORT || 3000;

app.listen(port,() => {
    console.log('listenning on port ',port);
});

const {TaskModel} = require('./models/task');
const {UserModel} = require('./models/user');

/*
const main = async() =>{
   const user = await UserModel.findById('5da9d4f0df59971e60d35501');
   await user.populate('tasks').execPopulate();
   console.log(user.tasks);
}

main();
*/
