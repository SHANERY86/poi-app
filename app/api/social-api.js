'use strict';

const Place = require('../models/place');
const Boom = require('@hapi/boom');
const Social = require("../controllers/social");

const SocialApi = {
    deleteAllRatings: {
        auth: false,
        handler: async function (request, h) { 
        await Place.ratingDb.remove({});
        return { success: true };
    }
},
    setRatingForPlace: {
        auth: false,
        handler: async function (request, h) { 
        const place = await Place.placeDb.findById(request.params.id);
        const ratingInput = request.payload.rating; 
        const user = request.payload.user;
        const newRating = new Place.ratingDb({
            user: user,
            place: place,
            rating: ratingInput
        })
        newRating.save();
        return newRating;
    }
},
    getRatings: {
        auth: false,
        handler: async function (request, h) { 
            const ratings = await Place.ratingDb.findAll();
            return ratings;       
    }
},
    makeReview: {
        auth: false,
        handler: async function (request, h) {
            const inputReview = request.payload;
            const review = new Place.reviewDb(inputReview);
            await review.save();
            return review;
        }
    },
    editReview: {
        auth: false,
        handler: async function (request, h) {  
            const reviewId = request.params.id;
            const review = await Place.reviewDb.findById(reviewId);
            const reviewEdit = request.payload.edit;
            review.review = reviewEdit;
            await review.save();
            return review;       
    }
},
    deleteReview: {
        auth: false,
        handler: async function (request, h) {
            const review = await Place.reviewDb.findById(request.params.id);
            await review.remove();
            return { success: true };
        }
          },
    deleteAllReviews: {
        auth: false,
        handler: async function (request, h) {
            const reviews = Place.reviewDb.findAll();
            await reviews.remove();
            return { success: true };
        }
    },
    getReviews: {
        auth: false,
        handler: async function (request, h) {
            const reviews = Place.reviewDb.findAll();
            return reviews;    
        }    
    },
    getReview: {
        auth: false,
        handler: async function (request, h) {       
            const review = await Place.reviewDb.findById(request.params.id);
            return review;
        }
    },

    getAllComments: {
        auth: false,
        handler: async function (request, h) {      
            const comments = await Place.commentsDb.findAll();
            return comments;  
        }   
    },

    getComment: {
        auth: false,
        handler: async function (request, h) { 
            const comment = await Place.commentsDb.findById(request.params.id);
            return comment             
        }
    },

    deleteAllComments: {
        auth: false,
        handler: async function (request, h) { 
            const comments = Place.commentsDb.findAll();
            if(comments){
            await comments.remove();
            return( { success: true } );
            }
        }        
    },

    makeComment: {
        auth: false,
        handler: async function (request, h) { 
            const input = request.payload;
            const comment = new Place.commentsDb(input);
            await comment.save();
            return comment;
        }
    },

    deleteComment: {
        auth: false,
        handler: async function (request, h) { 
            const comment = await Place.commentsDb.findById(request.params.id);
            await comment.remove();
            return( { success: true } );    
        }    
    },

    editComment: {
        auth: false,
        handler: async function (request, h) { 
            const comment = await Place.commentsDb.findById(request.params.id);
            const input = request.payload;
            comment.comment = input.edit;
            comment.save();
            return comment; 
        }      
    },
    makeReply: {
        auth: false,
        handler: async function (request, h) { 
            const comment = await Place.commentsDb.findById(request.params.id);    
            const reply = request.payload;
            comment.replies.push(reply);
            comment.save();
            return comment;
        }
    },
   editReply: {
        auth: false,
        handler: async function (request, h) { 
            const replyId = request.params.id;
            const replyEdit = request.payload.edit;
            const replyInfo = await Social.getCommentAndReplyIndex(replyId);
            const comment = replyInfo.comment;
            const index = replyInfo.replyIndex;
            comment.replies[index].reply = replyEdit;
            comment.save();
            return comment;        
        }  
    },
    deleteReply: {
        auth: false,
        handler: async function (request, h) { 
            const replyId = request.params.id;
            const replyInfo = await Social.getCommentAndReplyIndex(replyId);
            const comment = replyInfo.comment;
            const index = replyInfo.replyIndex;
            comment.replies[index].remove();
            comment.save();
            return comment;
    }
    }
}

module.exports = SocialApi;