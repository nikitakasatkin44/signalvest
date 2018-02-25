const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const pathLib = require('path');
const mongoose = require('mongoose');
const configDB = require('../config/database.js');
const connection = mongoose.createConnection(configDB.imagesDB);
const autoIncrement = require('mongoose-auto-increment');

const cloakSchema = mongoose.Schema({
    vestID: { type: mongoose.Schema.Types.ObjectId },
    path: {
        type: String,
        required: true,
        trim: true
    },
    originalname: {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    price: {
        type: Number,
        default: 200
    },
    description: {
        type: String
    }
});

cloakSchema.plugin(autoIncrement.plugin, {
    model: 'cloaks',
    field: 'vestID',
    startAt: 1,
    incrementBy: 1
});

const Cloak = connection.model('cloaks', cloakSchema);

router.addCloak = function(cloak, callback) {
    Cloak.create(cloak, callback);
};

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/cloaks/')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage});

router.post('/uploadCloak', isLoggedIn, upload.any(), function(req, res, next) {

    if (req.user.local.role !== 'admin') res.redirect('/');

    const path = '/cloaks/' + pathLib.basename(req.files[0].path);
    const cloakName = pathLib.parse(req.files[0].originalname).name;
    const price = req.body.price;
    const description = req.body.description;

    const cloak = {};
    cloak['path'] = path;
    cloak['originalname'] = cloakName;
    cloak['price'] = price;
    cloak['description'] = description;

    router.addCloak(cloak, function(err) {
        if (err) {
            err.error_text = 'Ошибка при загрузке плаща';
            return next(err);
        }
    });
    res.redirect('/product/2');
});

router.get('/cloak/:vestID',function(req, res, next){
    try {
        const vestID = req.params.vestID || 1;
        Cloak.findOne({ vestID: parseInt(vestID) }).exec((err, file) => {
            if (err) {
                err.error_text = 'Не существует плаща с таким идентификатором';
                return next(err);
            }

            let user = '';
            if (isLoggedIn) {user = req.user}

            res.render("vest.pug",{
                image: file,
                user: user,
                activeLink: 'product_2',
                updatePriceLink: "/update-cloak",
                updateDescription: "/update-cloak-description",
                title: 'Сигнальные жилеты оптом. Signalvest-kostroma',
                desc: file.description.split("\r\n")
            });
        })
    } catch(err) {
        console.log('Не найден жилет');
    }

});

router.get('/product/2', function(req, res, next) {
    let user = '';
    if (isLoggedIn) {user = req.user}

    Cloak.find()
        .select('originalname path price vestID')
        .sort({originalname: 'asc'})
        .exec(function(err, cloaks) {
            Cloak.count().exec(function(err, count) {
                res.render('product.pug', {
                    images: cloaks,
                    activeLink: 'product_2',
                    user: user,
                    action: 'Добавить плащ',
                    title: 'Сигнальные жилеты оптом. Signalvest-kostroma',
                    modalTitle: 'Загрузка нового плаща',
                    uploadAction: '/uploadCloak',
                    rootFolder: '/cloak/'
                })
            })
        })
});

router.post('/update-cloak', function(req ,res, next) {

    if (req.user.local.role !== 'admin') res.redirect('/');

    const vestID = req.body.id;
    const newPrice = req.body.price;
    Cloak.findByIdAndUpdate(vestID, { price: newPrice}, function(err, result) {
        if (err) throw err;
        console.log(result);
    });
    res.redirect('/product/2');
});

router.post('/update-cloak-description', function(req, res, next) {
    const vestID = req.body.vestID;
    const newHeader = req.body.headerText;
    const newDesc = req.body.description;
    Cloak.findOneAndUpdate({vestID: parseInt(vestID)}, { originalname: newHeader, description: newDesc}, function(err, result) {
        if (err) throw err;
        console.log(result);
    });
    res.redirect('/product/2');
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

module.exports = router;