const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');
const pathLib = require('path');
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
        type: String,
        default: 100
    },
    description: {
        type: String
    },
    composition: {
        type: String
    },
    serial: {
        type: Number
    },
    discount: {
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

router.post('/uploadPhoto', isLoggedIn, upload.any(), function(req, res, next) {

    if (req.user.local.role !== 'admin') res.redirect('/');

    const path = '/uploads/' + pathLib.basename(req.files[0].path);
    const imageName = pathLib.parse(req.files[0].originalname).name;
    const price = req.body.price;
    const description = req.body.description;

    const imagePath = {};
    imagePath['path'] = path;
    imagePath['originalname'] = imageName;
    imagePath['price'] = price;
    imagePath['description'] = description;

    router.addImage(imagePath, function(err) {
        if (err) {
            err.error_text = 'Ошибка при загрузке жилета';
            return next(err);
        }
    });
    res.redirect('/product/1');
});

router.get('/vest/:vestID',function(req, res, next){
    // try {
    //     Image.findById(req.params.id, function(err, file){
    //         if (err) {
    //             err.error_text = 'Не существует жилета с тамим идентификатором';
    //             return next(err);
    //         }
    //         let user = '';
    //         if (isLoggedIn) {user = req.user}
    //
    //         res.render("vest.pug",{
    //             image: file,
    //             user: user,
    //             activeLink: 'product_1',
    //             updatePriceLink: "/update-vest",
    //             updateDescription: "/update-description",
    //             title: 'Сигнальные жилеты оптом',
    //             currentVestID:
    //         });
    //
    //     });
    // }
        Image.count().exec(function(err, count) {
            try {
                const vestID = req.params.vestID || 1;
                if (req.params.vestID !== '0') {
                    Image.findOne({ vestID: parseInt(vestID) }).exec((err, file) => {
                        if (err || !file) {
                            if (!err) {err = {}}
                            err.error_text = 'Не существует жилета с таким идентификатором';
                            return next(err);
                        }

                        let user = '';
                        if (isLoggedIn) {user = req.user}

                        res.render("vest.pug",{
                            image: file,
                            user: user,
                            activeLink: 'product_1',
                            updatePriceLink: "/update-vest",
                            updateDescription: "/update-description",
                            title: 'Сигнальные жилеты оптом',
                            isFirstVest: file.vestID <= 1,
                            isLastVest: count <= file.vestID,
                            desc: file.description.split("\r\n")
                        });
                    })
                }
                else {
                    res.redirect('/product/1');
                }

            }
            catch (err) {
                console.log('Не найден жилет');
            }
        });
});

router.get('/product/1', function(req, res, next) {
    let user = '';
    if (isLoggedIn) {user = req.user}
    const perPage = 30;

    Image.find()
        .select('originalname path price vestID serial')
        .limit(perPage)
        .sort({
            vestID: 'asc'
        })
        .exec(function(err, vests) {
            Image.count().exec(function(err, count) {
                res.render('product.pug', {
                    images: vests,
                    pages:  Math.ceil(count/perPage),
                    activeLink: 'product_1',
                    user: user,
                    action: 'Добавить жилет',
                    title: 'Сигнальные жилеты оптом. Signalvest-kostroma',
                    modalTitle: 'Загрузка нового жилета',
                    uploadAction: '/uploadPhoto',
                    rootFolder: '/vest/'
                })
            })
        })
});

// router.get('/product/:page', function(req, res, next) {
//     let user = '';
//     if (isLoggedIn) {user = req.user}
//     const perPage = 30;
//     const page = Math.max(0, req.param('page'));
//
//     let title;
//     let modalTitle;
//     if (page == 1) {
//         title = 'Жилеты';
//         modalTitle = 'Загрузка нового жилета';
//     }
//
//     if (page == 2) {
//         title = 'Плащи';
//         modalTitle = 'Загрузка нового плаща';
//     }
//
//     Image.find()
//         .select('originalname path price vestID')
//         .limit(perPage)
//         .skip((perPage * page) - perPage)
//         .sort({
//             originalname: 'asc'
//         })
//         .exec(function(err, vests) {
//             Image.count().exec(function(err, count) {
//                 res.render('product.pug', {
//                     images: vests,
//                     current: page,
//                     pages:  Math.ceil(count/perPage),
//                     activeLink: 'product_' + page,
//                     user: user,
//                     action: 'Добавить жилет',
//                     title: title,
//                     modalTitle: modalTitle
//                 })
//             })
//         })
// });

router.post('/update-vest', function(req ,res, next) {

    if (req.user.local.role !== 'admin') res.redirect('/');

    const vestID = req.body.id;
    const newPrice = req.body.price;
    Image.findByIdAndUpdate(vestID, { price: newPrice}, function(err, result) {
        if (err) throw err;
        console.log(result);
    });
    res.redirect('/product/1');
});

router.post('/update-description', function(req, res, next) {
    try {
        const vestID = req.body.vestID;
        const newHeader = req.body.headerText;
        const newDesc = req.body.description;
        const newVestID = req.body.newVestID;
        const newDiscount = req.body.discount;
        Image.findOneAndUpdate({vestID: parseInt(vestID)}, {
                originalname: newHeader,
                description: newDesc,
                vestID: newVestID,
                discount: newDiscount
            },
            function(err, result) {
                if (err) throw err;
                console.log(result);
            });
        res.redirect('/product/1');
    } catch (err) {
        console.log('Ошибка при редактировании описания жилета')
    }

});

router.post('/update-discount', function(req, res, next) {
    try {
        const vestID = req.body.vestID;
        const newDiscount = req.body.discount;
        Image.findOneAndUpdate({vestID: parseInt(vestID)}, {
                discount: newDiscount
            },
            function(err, result) {
                if (err) throw err;
                console.log(result);
            });
        res.redirect('/product/1');
    } catch (err) {
        console.log('Ошибка при редактировании скидки по жилету')
    }

});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

module.exports = router;