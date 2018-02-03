const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const personSchema = new Schema({
    name: String,
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true },
    admin: Boolean,
    created_at: Date
});

personSchema.methods.getRole = function() {

};

const Person = mongoose.model('Person', personSchema);

module.exports = Person;