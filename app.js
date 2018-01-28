const express = require('express');
const app = express();
const passport = require('passport');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const fs = require('fs');
const port = process.env.PORT || 80;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const routerImage = require('./routes/imagefile');
const configDB = require('./config/database.js');

mongoose.connect(configDB.imagesDB);

mongoose.connection.on('error', function (err){
    console.log('Mongodb connection error: ' + err);
});

require('./config/passport')(passport);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('trust proxy', true);

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(morgan('combined', {stream: accessLogStream}));
app.use(session({resave: true, secret: 'handjomandjopendjo', saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./auth/routes.js')(app, passport);
app.use('/', routerImage);
app.use(express.static('public'));
app.use(express.static('public/uploads'));

const routes = require('./routes/imagefile');

app.get('/images', function(req, res) {
    routes.getImages(function(err, vests) {
        if (err) {throw err;}

        res.render('images.pug', {
            images: vests
        });
    });
});

app.get('/images/:id', function(req, res) {
    routes.getImageById(req.params.id, function(err, genres) {
        if (err) {throw err;}
        res.send(genres.path)
    });
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});

module.exports = app;