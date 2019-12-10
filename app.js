const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

require('dotenv').config();
console.log(process.env);

// const { MongoDBUsername, MongoDBPassword } = require('./config/config');
//const DATABASE_NAME = 'messages';
// const MONGODB_URI = 'mongodb+srv://' + MongoDBUsername + ':' + MongoDBPassword + '@cluster0-oehn6.mongodb.net/' + DATABASE_NAME +'?retryWrites=true&w=majority';
const MONGODB_URI = 
`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-oehn6.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;
console.log(MONGODB_URI);
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

const accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'), { flags: 'a' });

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

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
        //const server = app.listen(8080);
        const server = app.listen(process.env.PORT || 8080);
        const io = require('./socket').init(server);
        io.on('connection', socket => {
            console.log('Client connected');
        });
        console.log(server);
        console.log(process.env.PORT);
    })
    .catch(err => console.log(err));