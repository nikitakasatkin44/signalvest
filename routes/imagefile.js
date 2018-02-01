const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');
const pathLib = require('path');
const db = mongoose.connection;

const configDB = require('../config/database.js');
const Schema = mongoose.Schema;
const autoIncrement = require('mongoose-auto-increment');
const connection = mongoose.createConnection(configDB.imagesDB);
autoIncrement.initialize(connection);

const imagePath = mongoose.Schema({
    vestID: { type: Schema.Types.ObjectId },
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
        default: Date.now
    },
    price: {
        type: Number,
        default: 100
    },
    description: {
        type: String
    },
    composition: {
        type: String
    }
});

imagePath.plugin(autoIncrement.plugin, {
    model: 'files',
    field: 'vestID',
    startAt: 1,
    incrementBy: 1,
});
const Image = connection.model('files', imagePath);

router.getImages = function(callback, limit) {
    Image.find(callback).limit(limit);
};

router.getImageById = function(id, callback) {
    Image.findById(id, callback);
};

router.addImage = function(image, callback) {
    Image.create(image, callback);

    if (callback) {
        console.log('Ошибка при добавлении жилета');
    }
};

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/') // Директория, в которую попадают загружаемые файлы
    },

    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage});

router.post('/uploadPhoto', upload.any(), function(req, res, next) {  // Загрузить изображение
    // res.send(req.files);

    const path = '/uploads/' + pathLib.basename(req.files[0].path);
    const imageName = pathLib.parse(req.files[0].originalname).name;

    const imagePath = {};
    imagePath['path'] = path;
    imagePath['originalname'] = imageName;

    router.addImage(imagePath, function(err) {});
    res.redirect('/product');
});

router.get('/vest/:id',function(req,res){  // Получить одну фотографию
    Image.findById(req.params.id,function(err,file){
        if (err) {
            throw err;
        }
        console.log(file);
        console.log(file.path);
        res.render("vest.pug",{image: file});

    });
});

router.get('/product/:page', function(req, res, next) {
    const perPage = 6;
    const page = Math.max(0, req.param('page'));

    Image.find()
        .select('originalname path price vestID')
        .limit(perPage)
        .skip((perPage * page) - perPage)
        .sort({
            originalname: 'asc'
        })
        .exec(function(err, vests) {
            Image.count().exec(function(err, count) {
                res.render('product.pug', {
                    images: vests,
                    current: page,
                    pages:  Math.ceil(count/perPage),
                    activeLink: 'product'
                })
            })
        })


});

module.exports = router;