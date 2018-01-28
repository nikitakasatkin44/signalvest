const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');
const pathLib = require('path');

const imagePath = mongoose.Schema({
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
    }
});

const Image = module.exports = mongoose.model('files', imagePath);

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
    res.redirect('/admin');
});

router.get('/picture/:id',function(req,res){  // Получить одну фотографию
    Image.findById(req.params.id,function(err,file){
        if (err) {
            throw err;
        }
        console.log(file);
        console.log(file.path);
        res.render("image.pug",{image: file.path});

    });
});

module.exports = router;