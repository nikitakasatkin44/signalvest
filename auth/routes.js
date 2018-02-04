const express = require('express');
const getdate = require('./../config/getdate');
const Param = require('./models/param');

module.exports = function(app, passport) {

	app.get('/', function(req, res) {

        let user = '';
        if (isLoggedIn) {user = req.user}

		res.render('index.pug', {
            user: user,
            activeLink: 'index',
            title: 'Сигнальные жилеты'
		});
	});

    const routes = require('../routes/imagefile');

    app.get('/product', function(req, res) {
        routes.getImages(function(err, vests) {
            if (err) {
                throw err;
            }
            let user = '';
            if (isLoggedIn) {user = req.user}
            res.render('product.pug', {
                images: vests,
                user: user,
                activeLink: 'product',
                title: 'Наша продукция'
            });
        });
    });

	app.get('/login', function(req, res) {
		res.render('login.pug', {
		    message: req.flash('loginMessage'),
            title: 'Авторизация'
		});
	});

	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/',
		failureRedirect : '/login',
		failureFlash : true
	}));

	app.get('/signup', function(req, res) {
		res.render('signup.pug', {
		    message: req.flash('signupMessage'),
            title: 'Регистрация'
		});
	});

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/',
		failureRedirect : '/signup',
		failureFlash : true
	}));

	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.pug', {
			user : req.user,
            regDate: getdate.curDate(req.user.local.regDate),
            title: 'Личный профиль'
		});
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/about', function (req, res) {
        let user = '';
        if (isLoggedIn) {user = req.user}
		res.render('about.pug', {
            user: user,
			activeLink: 'about',
            title: 'О компании'
		})
    });

    app.get('/payment', function (req, res) {
        let user = '';
        if (isLoggedIn) {user = req.user}
        res.render('payment.pug', {
            user: user,
            activeLink: 'payment',
            title: 'Оплата заказа'
        })
    });

    app.get('/delivery', function (req, res) {
        let user = '';
        if (isLoggedIn) {user = req.user}
        res.render('delivery.pug', {
            user: user,
            activeLink: 'delivery',
            title: 'Доставка заказа'
        })
    });

    app.get('/contact', function(req, res) {
        let user = '';
        if (isLoggedIn) {user = req.user}
        res.render('contact.pug', {
            user: user,
            activeLink: 'contact',
            title: 'Контактные данные'
        });
    });

    app.get('/admin', isLoggedIn, (req, res) => {

        user = req.user;

        if (!user)
            res.redirect('/');

        if (user.local.role !== 'admin')
            res.redirect('/');

        res.render('admin.pug', {});
            });

    app.post('/admin-edit', (req, res) => {

        const newParam = new Param();
        newParam.adminSettings.EditMode = true;

        newParam.save(function(err) {
            if (err)
                throw err;
        });
    });

    // app.get('/createAdmin', (req, res) => {
    //     const newAdmin = new User();
    //
    //     newAdmin.local.email = 'nikita.kasatkin44@gmail.com';
    //     newAdmin.local.password = newAdmin.generateHash('1234');
    //     newAdmin.local.login = 'nick';
    //     newAdmin.local.regDate = new Date();
    //
    //     newAdmin.save(function(err) {
    //         if (err) throw err;
    //
    //         console.log('Admin created!');
    //     });
    // })
};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}