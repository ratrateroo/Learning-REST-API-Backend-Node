const { validationResult } = require('express-validator/check');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [{
            _id: '1',
            title: 'First Post',
            content: 'This is the first post!',
            imageUrl: 'images/duck.jpg',
            creator: {
                name: 'Mark'
            },
            createdAt: new Date()
        }]
    });
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
        
    }
    const title = req.body.title;
    const content = req.body.content;
    // Create post in db
    const post = new Post({
        title: title,
        content:content,
        imageUrl: 'images/duck.jpg',
        creator: { name: 'Mark '}
    });
    post
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Post created successfully!',
                post: result
            });
        })
        .catch(err => {
            console.log('Creating Post');
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
    

    console.log(title, content);
};