var mongoose = require('mongoose');

module.exports = mongoose.model('Credentials',{
    fullName : {type : String, default: ''},
    email: {type:String, default: ''},
    password: {type: String, default: ''}
});