const mongoose = require('mongoose');

const paramSchema = mongoose.Schema({

    adminSettings: {
        EditMode: Boolean
    }

});

module.exports = mongoose.model('Param', paramSchema);