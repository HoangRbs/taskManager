const app = require('./app');

const port = process.env.PORT||3000;

const server = app.listen(port,() => {
    console.log('listenning on port ',port);
});

module.exports = server;














/*
const {TaskModel} = require('./models/task');
const {UserModel} = require('./models/user');

const main = async() =>{
   const user = await UserModel.findById('5da9d4f0df59971e60d35501');
   await user.populate('tasks').execPopulate();
   console.log(user.tasks);
}

main();
*/
