const mongoose = require('mongoose');

module.exports = function(){
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser: true,
        useCreateIndex: true
    });
        
}

