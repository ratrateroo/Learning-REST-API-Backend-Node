const { validationResult } = require('express-validator/check');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    Post.find()
    .then(posts => {
        res.status(200).json({message: 'Fetched post succesfully.', posts: posts})
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500
        }
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

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if(!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({message: 'Post fetched.', post: post});
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};