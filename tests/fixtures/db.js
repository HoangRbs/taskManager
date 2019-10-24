const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {UserModel} = require('../../src/models/user');
const {TaskModel} = require('../../src/models/task');

const userOneId = new mongoose.Types.ObjectId();
const userOneInfo = {
    _id: userOneId,
    name: 'random',
    email: 'random@gmail.com',
    password: '12345',
    tokens:[{
        token: jwt.sign({ _id: userOneId.toHexString() },process.env.JWT_SECRET_KEY)
    }]
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwoInfo = {
    _id: userTwoId,
    name: 'random2',
    email: 'random2@gmail.com',
    password: '12345',
    tokens:[{
        token: jwt.sign({ _id: userTwoId.toHexString() },process.env.JWT_SECRET_KEY)
    }]
};

const taskOneInfo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'user 1 do task one',
    isCompleted: false,
    owner: userOneId
} 

const taskTwoInfo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'user 1 do task two',
    isCompleted: false,
    owner: userOneId
} 

const taskThreeInfo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'user 2 do task three',
    isCompleted: true,
    owner: userTwoId
} 

const initDatabase = async() =>{
    await UserModel.collection.deleteMany({});
    await TaskModel.collection.deleteMany({});

    const decodedPassword1 = await bcrypt.hash(userOneInfo.password,8);
    const decodedPassword2 = await bcrypt.hash(userTwoInfo.password,8);
    
    const userOne = new UserModel({
        ...userOneInfo,
        password: decodedPassword1
    });

    const userTwo = new UserModel({
        ...userTwoInfo,
        password: decodedPassword2
    });

    const taskOne = new TaskModel(taskOneInfo);
    const taskTwo = new TaskModel(taskTwoInfo);
    const taskThree = new TaskModel(taskThreeInfo);

    await userOne.save();
    await userTwo.save();
    
    await taskOne.save();
    await taskTwo.save();
    await taskThree.save();
}

module.exports = {
    userOneId,
    userOneInfo,
    userTwoId,
    userTwoInfo,
    taskOneInfo,
    taskTwoInfo,
    taskThreeInfo,
    initDatabase,
}
