const LocalStrategy   = require('passport-local').Strategy;
const User       		= require('../auth/models/user');
const moment = require('moment');
const getdate = require('./getdate');

moment.locale('ru');
module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'login',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, login, password, done) {
        User.findOne({ 'local.login' :  login }, function(err, user) {
            if (err)
                return done(err);

            if (user) {
                return done(null, false, req.flash('signupMessage', 'Этот логин уже занят.'));
            } else {

                const newUser            = new User();

                newUser.local.login    = login;
                newUser.local.password = newUser.generateHash(password);
                newUser.local.email = req.body.email;
                newUser.local.phone = req.body.phone;
                newUser.local.regDate = new Date();
                newUser.local.role = 'admin';

                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });
    }));

    passport.use('local-login', new LocalStrategy({
        usernameField : 'login',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, login, password, done) {

        User.findOne({ 'local.login' :  login }, function(err, user) {
            if (err)
                return done(err);

            if (!user)
                return done(null, false, req.flash('loginMessage', 'Пользователь не найден.'));

            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Пароль неправильный.'));

            return done(null, user);
        });
    }));
};
