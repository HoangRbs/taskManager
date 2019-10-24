const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { TaskModel } = require('../models/task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowerCase: true,
        validate(value){
            if(!validator.isEmail(value))
                throw new Error('email is invalid');
        }
    },
    password:{
        type: String,
        required: true,
        minlength: 5,
        trim: true,
        validate(value){
            if(value.toLowerCase().includes('password'))
                throw new Error('password cannot contain password');
        }
    },
    age:{
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0)
                throw new Error('age cannot < 0');
        }
    },
    tokens:[
        {
            token:{
                type: String,
                required: true
            }
        }
    ],
    avatar: {
        type: Buffer
    }
},
{
    timestamps: true
});

userSchema.virtual('tasks',{
    ref: 'task',
    localField: '_id',
    foreignField: 'owner'
});

//auth = authentication/authorization
userSchema.methods.generateAuthToken = async function() {   //arrow function does not have this keyword
    const token = jwt.sign({ _id: this._id.toHexString() },process.env.JWT_SECRET_KEY);
    this.tokens = this.tokens.concat({token: token});
    await this.save();
    
    return token;
}

userSchema.methods.toJSON = function(){
    const userObject = this.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

userSchema.statics.findByCredentials = async(email,password) => {

    const user = await UserModel.findOne({email});
    if(!user)
        throw new Error('unable to loggin: wrong email');
    
    const isMatch = await bcrypt.compare(password,user.password);
    
    if(!isMatch)
        throw new Error('unable to loggin: wrong password');
    
    return user;
}

userSchema.pre('remove',async function (next){
    const user = this;   //arrow function does not have THIS keyword
    await TaskModel.deleteMany({
        owner: user._id
    });
    next();
});

const UserModel = mongoose.model('user',userSchema);

module.exports = {
    UserModel : UserModel
}