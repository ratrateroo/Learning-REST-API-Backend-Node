const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const { MongoDBUsername, MongoDBPassword } = require('./config/config');
const DATABASE_NAME = 'messages';
const MONGODB_URI = 'mongodb+srv://' + MongoDBUsername + ':' + MongoDBPassword + '@cluster0-oehn6.mongodb.net/' + DATABASE_NAME +'?retryWrites=true&w=majority';
//const MONGODB_URI = 'mongodb://localhost/offlinedatabase';
const app = express();

const fileStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
        
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}



//app.use(bodyParser.urlencoded()); //x-www-form-urlencoded <form>
app.use(bodyParser.json()); //application/json HEADER
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
 

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen(8080);
    })
    .catch(err => console.log(err));