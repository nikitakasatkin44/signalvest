const express = require('express');
const app = express();
const passport = require('passport');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');
const port = process.env.PORT || 80;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const routerImage = require('./routes/imagefile');
const routerCloak = require('./routes/cloak');
const configDB = require('./config/database.js');
const helpers = require('view-helpers');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const logDirectory = path.join(__dirname, 'log');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const accessLogStream = rfs('access.log', {
    interval: '1d',
    path: logDirectory
});

app.use(helpers('app'));
mongoose.connect(configDB.imagesDB);

mongoose.connection.on('error', function (err){console.log('Mongodb connection error: ' + err);});

require('./config/passport')(passport);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('trust proxy', true);

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('combined', {stream: accessLogStream}));
app.use(session({resave: true, secret: 'handjomandjopendjo', saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./auth/routes.js')(app, passport);
app.use('/', routerImage);
app.use('/', routerCloak);
app.use(express.static('public'));
app.use(express.static('public/uploads'));

const routes = require('./routes/imagefile');

app.use(function(error, req, res, next) {
    let err;
    if (error.error_text) err = error.error_text;
    res.render('error.pug', {
        error_text: err,
        message: error.message
    })
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});

module.exports = app;