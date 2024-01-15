const Post = require('../models/post');
const Comment = require('../models/comment');
const { body, validationResult } = require("express-validator");
const fs = require('fs');
const path = require('path');
const upload = require('../helpers/multer')
const cloudinary = require('../helpers/cloudinary')
const asyncHandler = require('express-async-handler');
const validator = require('validator');


exports.post_list = async(req,res,next)=>{
    try {
        const posts = await Post.find()
        .sort({ dateCreated: -1 }).populate("user");
        return res.render("home-page", {
            posts: posts,
        })
    } catch (error) {
        return next(error);
    }
}

exports.new_blog_get = (req,res,next)=>{
    return res.render("new-blog-form", {
        title: "Create New blog",
    });
}


exports.new_blog_post = [ 

    body("title", "Title should have at least 2 characters")
    .trim()
    .isLength({ min: 2 })
    .escape(),

    body("caption", "Caption should have at least 2 characters")
    .trim()
    .isLength({ min: 2 })
    .escape(),

    body("content", "Content should have at least 2 characters")
    .trim()
    .isLength({ min: 2 })
    .escape(),
    body("postVisibility", "one must be selected"),

    asyncHandler(async (req, res) => {
        const uploader = async (path) => await cloudinary.uploads(path, "Images")
        try {
    
                const urls = []
                const files = req.files; 
                for(const file of files){
                    const { path } = file; 
                    const newPath = await uploader(path)
                    urls.push(newPath)
                    fs.unlinkSync(path)
                }
 
                if(req.body.postVisibility === 'public'){
                    const post = new Post({
                        user: req.user._id,
                        title: req.body.title,
                        caption: req.body.caption,
                        content: req.body.content,
                        isPrivate: false,
                        files: urls,
                    });
                    await post.save();
                    return res.redirect("/");
                } else{
                    const post = new Post({
                        user: req.user._id,
                        title: req.body.title,
                        caption: req.body.caption,
                        content: req.body.content,
                        isPrivate: true,
                        files: urls,
                    });
                    await post.save();
                    return res.redirect("/");
                }
           
        } catch (error) {
            return res.status(412).send({
                success: false,
                message: error.message
            })
        }
    
    })
];

exports.my_account_get = async(req,res,next)=>{

    try {
        const posts = await Post.find({ user: req.user.id }).sort({ dateCreated: -1 });

        return res.render("my-account-page", {
            title: "Post History",
            posts: posts,
        });
    } catch (error) {
        console.error('Error:', error);
        return next(error);
    }
}

exports.my_account_delete_get = async (req, res, next) => {
    try {
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comments = await Comment.find({ post: postId });
        
        if (comments.length > 0) {
            for (let i = 0; i < comments.length; i++) {
                const commentId = comments[i]._id.toString();
                await Comment.findByIdAndDelete(commentId);
            }
        }
        await Post.findByIdAndDelete(postId);

        return res.redirect("/my-account")
    } catch (error) {
        return next(error);
    }
};

exports.post_privacy = async(req,res,next)=>{
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);

        post.isPrivate = !post.isPrivate;
        await post.save();

        return res.redirect("/my-account");

    } catch (error) {
        return next(error);
    }
}

exports.post_detail_get = async(req,res,next)=>{
    try {
        const posts = await Post.findById(req.params.id).populate("user");
        const totalLikes = posts.likes.length;

        const comments = await Comment.find({ post: req.params.id }).populate("user");

        return res.render("post-detail", {
            posts: posts,
            totalLikes: totalLikes,
            comments: comments,
        })
    } catch (error) {
        return next(error);
    }
}

exports.post_like = async(req,res,next)=>{
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const posts = await Post.findById(postId);
        const hasLiked = posts.likes.includes(userId);
        if (hasLiked) {
            return res.send("u already liked the post");
        }
        posts.likes.push(userId);
        await posts.save();
        const redirectUrl = `/${postId}/post-detail`;

        return res.redirect(redirectUrl);
    } catch (error) {
        return next(error);
    }
}

exports.post_dislike = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const posts = await Post.findById(postId);

        // Check if the user has liked the post
        const hasLiked = posts.likes.includes(userId);

        if (!hasLiked) {
            return res.send("You haven't liked the post, so cannot dislike it.");
        }

        // Remove the user ID from the likes array
        posts.likes.pull(userId);
        await posts.save();

        const redirectUrl = `/${postId}/post-detail`;

        return res.redirect(redirectUrl);
    } catch (error) {
        return next(error);
    }
};

exports.add_post_comment = [
    body("comment", "Comment should have at least two characters")
    .trim()
    .isLength({ min: 2 })
    .escape(),
    async(req,res,next)=>{
        try {
            const postId = req.params.id;
            const userId = req.user.id;
            const comments = new Comment({
                content: req.body.comment,
                user: userId,
                post: postId,
            });
            await comments.save();
            return res.redirect(`/${postId}/post-detail`) 
        } catch (error) {
            return next(error);
        }
    },
];

exports.delete_post_comment = async(req,res,next)=>{
    try {
        const commentId = req.params.id;
        const comments = await Comment.findById(commentId);
        const postId = comments.post.toString();
        await Comment.findByIdAndDelete(commentId);
        return res.redirect(`/${postId}/post-detail`)
    } catch (error) {
        return next(error)
    }
}

exports.edit_post_get = async(req,res,next)=>{
    try {
        const postId = req.params.id;
        const posts = await Post.findById(postId).populate("user");
        return res.render("new-blog-form",{
            posts: posts,
        })
    } catch (error) {
        return next(error);
    }
}

exports.edit_post_post = [ 

    body("title", "Title should have at least 2 characters")
    .trim()
    .isLength({ min: 2 })
    .escape(),

    body("caption", "Caption should have at least 2 characters")
    .trim()
    .isLength({ min: 2 })
    .escape(),

    body("content", "Content should have at least 2 characters")
    .trim()
    .isLength({ min: 2 })
    .escape(),
    body("postVisibility", "one must be selected"),

    asyncHandler(async (req, res) => {
        const uploader = async (path) => await cloudinary.uploads(path, "Images")
        const postId = req.params.id;
        let post = await Post.findOne({_id: postId});
        try {
            if(post){
                await post.updateOne({_id: postId}, 
                    { $set: { "files": [] } })
                    
                if (req.method === 'POST') {
                    const urls = []
                    const files = req.files;
                    for (const file of files) {
                        const { path } = file;
                        const newPath = await uploader(path)
                        urls.push(newPath)
                        fs.unlinkSync(path)
                    }
                    if(req.body.postVisibility === 'public'){
                        post = await post.updateOne(
                            {
                                $set: {
                                    user: req.user._id,
                                    title: req.body.title,
                                    caption: req.body.caption,
                                    content: req.body.content,
                                    isPrivate: false,
                                    files: urls,
        
                                }
                            },
                            {}, { new: true }
                        )
                    } else {
                        post = await post.updateOne(
                            {
                                $set: {
                                    user: req.user._id,
                                    title: req.body.title,
                                    caption: req.body.caption,
                                    content: req.body.content,
                                    isPrivate: true,
                                    files: urls,
        
                                }
                            },
                            {}, { new: true }
                        )
                    }
    
                    return res.redirect("/my-account")
                } else {
                    return res.status(405).json({
                        err: `${req.method} method not allowed`
                    })
                }
            } else {
                return res.status(400).json({
                    success: false,
                    message: "post not found",
                })
            }
        } catch (error) {
            return next(error);
        }
    
    })
];