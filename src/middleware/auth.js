const jwt = require('jsonwebtoken');
const {UserModel} = require('../models/user');

const auth = async(req,res,next) => {
    try{
        const token = req.header('Authorization');
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
        const user = await UserModel.findOne({ _id: decoded._id, 'tokens.token': token});
        if(!user)
            throw new Error();

        req.user = user;
        req.token = token;
        next();
    }
    catch(e){
        res.status(401).send('not authenticate: ' + e);
    }
}

module.exports = auth;