const configDB = require('../config/database');
const mongoose = require('mongoose');
const Person = require('./person');
mongoose.connect(configDB.personDB);

const nick = new Person({
    name: 'Nikita',
    username: 'marauder',
    password: '1234',
    admin: true
});

// nick.save(function(err) {
//     if (err) throw err;
//
//     console.log('User saved successfully!');
// });

// Person.find({}, function(err, persons) {
//     if (err) throw err;
//
//     console.log(persons);
// });

// Person.find({ username: 'marauder'}, function(err, person) {
//     if (err) throw err;
//
//     console.log(person);
// })

// Person.findOneAndUpdate(
//     { username: 'marauder' },
//     { username: 'xdriver'},
//     function(err, person) {
//         if (err) throw err;
//
//         console.log(person);
//     });

Person.findByIdAndUpdate(1, { username: 'xdriver44'}, function(err, person) {
    if (err) throw err;

    console.log(user);
});