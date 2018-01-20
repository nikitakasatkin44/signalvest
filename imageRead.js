var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
var fs = require('fs');

var url = 'mongodb://localhost:27017/images';

mongoClient.connect(url, function(err, db) {
    if (err) {
        console.log('Sorry unable to connect to MongoDB Error:', err);
    } else {

        var bucket = new mongodb.GridFSBucket(db, {
            chunkSizeBytes: 1024,
            bucketName: 'images'
        });

        bucket.openDownloadStreamByName('dog.jpg').pipe(
            fs.createWriteStream('C:\\deploy\\signalvest\\images\\write-dog.jpg')).on('error',
            function(error) {
                console.log('Error:-', error);
            }).on('finish', function() {
            console.log('done!');
            process.exit(0);
        });
    }
});