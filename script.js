// Lets open database
const cfgDB = require('./config/database');
let acl = require('acl');
const mongoose = require('mongoose');
// const dbconnection = mongoose.connect(cfgDB.imagesDB, function(err) {
//     if(err) console.log('MongoDb: Connection error: ' + err);
// });

// mongoose.connection.on('open', function (ref) {
//     console.log('Connected to mongo server.');
//     var dbconnection = mongoose.connect('mongodb://localhost/acl-test', {});
//     console.log("Lets do this to " + dbconnection.connection.db);
//     acl = new acl(new acl.mongodbBackend(dbconnection.connection.db, "acl_"));
//
//     /* now assign permissions to roles */
//
// // allow guests to view posts
//     acl.allow("guest", "/index", "view");
//
// // allow registered users to view and create posts
// //acl.allow("registered users", "post", ["view", "create"]);
//
// // allow administrators to perform any action on posts
// //
//     acl.allow("nick", "/", "*");
// });
// mongoose.connection.on('error', function (err) {
//     console.log('Could not connect to mongo server!');
//     console.log(err);
// });

// const dbconnection1 = mongoose.connect('mongodb://localhost/acl-test', {});
const dbconnection1 = mongoose.connect(cfgDB.imagesDB, {});
acl = new acl(new acl.mongodbBackend(dbconnection1.connection.db, "acl_"));

mongoose.connection.on('open', function() {
    console.log('Connected to mongo server');

    acl.allow('nick', '/', 'view');
    acl.allow('nick', 'vests', 'edit');

    acl.isAllowed('nick', 'vests', 'edit', function(err, res) {
        if (res){
            console.log('Nick is allowed to view');
        }
    });

    acl.allowedPermissions('nick', 'vests', function(err, permissions){
        console.log(permissions);
    })

});

