const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const Blog = mongoose.model('Blog');
const key = require('../config/keys');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: key.accessKey,
    secretAccessKey: key.secretAccessKey,
    region: key.region
})

module.exports = app => {
    app.get('/api/upload', requireLogin, async (req, res) => {

        const keyFile = `${req.user.id}/${Date.now()}`;

        s3.getSignedUrl('putObject', {
            Bucket: key.bucketName,
            ContentType: 'image/jpeg',
            Key: keyFile
        }, (error, url) => {
            if (error) {
                console.log(error);
                res.send(error);
            }
            res.send({keyFile, url});
        })

    });


};
