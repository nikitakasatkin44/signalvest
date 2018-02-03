const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');
const autoIncrement = require('mongoose-auto-increment');
const configDB = require('../../config/database');
const connection = mongoose.createConnection(configDB.imagesDB);
autoIncrement.initialize(connection);

const userSchema = mongoose.Schema({
    local            : {
        userID: { type: mongoose.Schema.Types.ObjectId },
        login : {type: String, default: ''},
        name         : String,
        surname      : String,
        email        : String,
        password     : String,
        phone        : Number,
        regDate      : Date,
        role: {
            type: String,
            enum: ['guest', 'member', 'admin'],
            default: 'guest'
        }
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

});

userSchema.plugin(autoIncrement.plugin, {
    model: 'users',
    field: 'userID',
    startAt: 1,
    incrementBy: 1
});

const User = connection.model('users', userSchema);

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
