const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');
const path1 = require('path');

const imagePath = mongoose.Schema({
    path: {
        type: String,
        required: true,
        trim: true
    },
    originalname: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
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

// router.get('/', function(req, res, next) {
//     res.render('index.pug');
// });

router.post('/uploadPhoto', upload.any(), function(req, res, next) {  // Загрузить изображение
    res.send(req.files);

    const path = '/uploads/' + path1.basename(req.files[0].path);
    const imageName = req.files[0].originalname;

    const imagePath = {};
    imagePath['path'] = path;
    imagePath['originalname'] = imageName;

    router.addImage(imagePath, function(err) {

    });
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