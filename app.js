const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const feedRoutes = require('./routes/feed');

const { MongoDBUsername, MongoDBPassword } = require('./config/config');
const DATABASE_NAME = 'messages';
const MONGODB_URI = 'mongodb+srv://' + MongoDBUsername + ':' + MongoDBPassword + '@cluster0-oehn6.mongodb.net/' + DATABASE_NAME +'?retryWrites=true&w=majority';

const app = express();

//app.use(bodyParser.urlencoded()); //x-www-form-urlencoded <form>
app.use(bodyParser.json()); //application/json HEADER

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
 

app.use('/feed', feedRoutes);

mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen(8080);
    })
    .catch(err => console.log(err));