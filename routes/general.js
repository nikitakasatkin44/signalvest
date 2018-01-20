const express = require('express');
const router = express.Router();

router.get('/admin', (req, res) => {
    res.render('admin.pug', {

    })
});

const routes = require('./imagefile');
router.get('/product', function(req, res) {
    routes.getImages(function(err, vests) {
        if (err) {
            throw err;
        }
        res.render('product.pug', {
            images: vests
        });
    });
});

module.exports = router;

function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}