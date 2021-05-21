"use strict";

const Place = require("../models/place");
const User = require("../models/user");
const Places = require("./places");

const Social = {
    rating: {
        handler: async function (request, h) {
            const userid = request.auth.credentials.id;
            const user = await User.findById(userid);
            const placeId = request.params.id;
            const place = await Place.placeDb.findById(placeId).lean();
            const existingRating = await Place.ratingDb.find({ user: user, place: place });
            const ratingInput = request.payload.rating;
            if(!existingRating[0]){
            const rating = new Place.ratingDb({
                user: user,
                place: place,
                rating: ratingInput
             })
             await rating.save();
            }
            if(existingRating[0]){
                existingRating[0].rating = ratingInput;
                await existingRating[0].save();
            }
             const placeRatings = await Place.ratingDb.find( { place: placeId } );
             let ratingstotal = 0;
             let ratingsAvg = 0;
             let index = 0;
             placeRatings.forEach(function(placeRating) {
                 ratingstotal += placeRating.rating;
                 index++;
             })
             ratingsAvg = ratingstotal / index;
             const placeObj = await Place.placeDb.findById(placeId);
             placeObj.numberOfRatings = index;
             placeObj.rating = Math.round(ratingsAvg * 10)/10;
             await placeObj.save();
             const placeInfo = await Places.loadPlaceInfo(placeId,user._id);
             return h.view("place", { 
                 place: placeInfo.place, 
                 reviews: placeInfo.reviews, 
                 user: placeInfo.loggedInUser, 
                 comments: placeInfo.comments } );        
         }
    },
    writeReview: {
        handler: async function(request, h) {
            const placeId = request.params.id;
            const placeObj = await Place.placeDb.findById(placeId).lean();
            return h.view("review", { place: placeObj });
        }
    },
    review: {
        handler: async function(request, h) {
            const placeId = request.params.id;
            const place = await Place.placeDb.findById(placeId);
            const userid = request.auth.credentials.id;
            const user = await User.findById(userid);
            const currentDateAndTime = Social.getDateAndTime();
            const inputReview = request.payload.review; 
            const review = new Place.reviewDb({
                userId: userid,
                username: user.name,
                place: place,
                review: inputReview,
                dateAndTime: currentDateAndTime
            })
            await review.save();
            const placeInfo = await Places.loadPlaceInfo(placeId,user._id);
            return h.view("place", { 
                place: placeInfo.place, 
                reviews: placeInfo.reviews, 
                user: placeInfo.loggedInUser, 
                comments: placeInfo.comments } );        
        }
    },
    editReviewDisplay: {
        handler: async function(request, h) {
            const reviewId = request.params.id;
            const review = await Place.reviewDb.findById( { _id: reviewId }).lean();
            return h.view("review", { review: review });
        }
    },
    editReview: {
        handler: async function(request, h) {
            const userid = request.auth.credentials.id;
            const reviewId = request.params.id;
            const review = await Place.reviewDb.findById( { _id: reviewId });
            review.review = request.payload.review;
            const placeId = review.place;
            await review.save();
            const placeInfo = await Places.loadPlaceInfo(placeId,userid);
            return h.view("place", { 
                place: placeInfo.place, 
                reviews: placeInfo.reviews, 
                user: placeInfo.loggedInUser, 
                comments: placeInfo.comments } );        
        }
    },
    deleteReview: {
        handler: async function(request, h) {
            const userid = request.auth.credentials.id;            
            const review = await Place.reviewDb.findById( { _id: request.params.id } );
            const placeId = review.place;
            review.remove();
            const placeInfo = await Places.loadPlaceInfo(placeId,userid);
            return h.view("place", { 
                place: placeInfo.place, 
                reviews: placeInfo.reviews, 
                user: placeInfo.loggedInUser, 
                comments: placeInfo.comments } );        
        }          
    },
    addComment: {
        handler: async function(request, h) {
            const user = await User.findById(request.auth.credentials.id);
            const placeId = request.params.id;
            const place = await Place.placeDb.findById(placeId);
            const input = request.payload.comment;
            const currentDateAndTime = Social.getDateAndTime();
            const comment = new Place.commentsDb({
                userId: user._id,
                username: user.name,
                place: place,
                comment: input,
                dateAndTime: currentDateAndTime,
            })
            await comment.save();
            const placeInfo = await Places.loadPlaceInfo(placeId,user._id);
            return h.view("place", { 
                place: placeInfo.place, 
                reviews: placeInfo.reviews, 
                user: placeInfo.loggedInUser, 
                comments: placeInfo.comments } );        
        }
    },
    replyView: {
        handler: async function(request, h) { 
            const commentId = request.params.id;
            const comment = await Place.commentsDb.findById( { _id: commentId } ).lean();
            return h.view("reply", { comment: comment } );                
        }
    },
    editReplyView: {
        handler: async function(request, h) { 
                const replyId = request.params.id;
                var reply = null;
                const comments = await Place.commentsDb.find({}).lean();
                comments.forEach(function(comment){
                    const replies = comment.replies;
                    for(let i = 0; i < replies.length; i++){
                        if(replies[i]._id == replyId){
                            reply = replies[i];
                        }
                    }
                })
                return h.view("editcomment", { reply: reply } ); 
            }   
    },
    replyToReplyView: {
        handler: async function(request, h) {
            const replyId = request.params.id;
            var reply = null;
            const comments = await Place.commentsDb.find({}).lean();
            comments.forEach(function(comment){
                const replies = comment.replies;
                for(let i = 0; i < replies.length; i++){
                    if(replies[i]._id == replyId){
                        reply = replies[i];
                    }
                }
            })
            return h.view("reply", { reply: reply } );   
        }
    },
    addReply: {
        handler: async function(request, h) { 
            const inputId = request.params.id;
            const comment = await Place.commentsDb.findById(inputId);
            var commentForLoading = null;
            const userid = request.auth.credentials.id;
            const user = await User.findById(userid);
            if(comment){
            const dateAndTime = Social.getDateAndTime();
            const input = request.payload.reply;
            const reply = {
                userId: userid,
                username: user.name,
                reply: input,
                dateAndTime: dateAndTime
            }
            comment.replies.push(reply);
            await comment.save();
            commentForLoading = comment;
            }
            if(!comment){
                const replyInfo = await Social.getCommentAndReplyIndex(inputId);
                const returnedComment = replyInfo.comment;
                const commentToUpdate = await Place.commentsDb.findById(returnedComment._id);
                const dateAndTime = Social.getDateAndTime();
                const input = request.payload.reply;
                const reply = {
                    userId: userid,
                    username: user.name,
                    reply: input,
                    dateAndTime: dateAndTime
                }
                commentToUpdate.replies.push(reply);
                await commentToUpdate.save();
                commentForLoading = commentToUpdate;
            }
            const placeInfo = await Places.loadPlaceInfo(commentForLoading.place,user._id);
            return h.view("place", { 
                place: placeInfo.place, 
                reviews: placeInfo.reviews, 
                user: placeInfo.loggedInUser, 
                comments: placeInfo.comments } );        
        }                           
    },
    editCommentDisplay: {
        handler: async function(request, h) { 
            const commentId = request.params.id;
            const comment = await Place.commentsDb.findById(commentId).lean();
            return h.view("editcomment", { comment: comment } );
        }       
    },
    editComment: {
        handler: async function(request, h) {
            const userid = request.auth.credentials.id;
            const inputId = request.params.id;
            var commentForLoading = null;
            const comment = await Place.commentsDb.findById(inputId);
            if(comment){
            comment.comment = request.payload.comment;
            await comment.save();
            commentForLoading = await Place.commentsDb.findById(comment._id).lean();
            } 
            if(!comment){
                const replyInfo = await Social.getCommentAndReplyIndex(inputId);
                const returnedComment = replyInfo.comment;
                const index = replyInfo.replyIndex;
                const commentToUpdate = await Place.commentsDb.findById(returnedComment._id);
                commentToUpdate.replies[index].reply = request.payload.reply;
                await commentToUpdate.save();  
                commentForLoading = await Place.commentsDb.findById(commentToUpdate._id).lean();                         
            }           
            const placeInfo = await Places.loadPlaceInfo(commentForLoading.place,userid);
            return h.view("place", { 
                place: placeInfo.place, 
                reviews: placeInfo.reviews, 
                user: placeInfo.loggedInUser, 
                comments: placeInfo.comments } );          
        }
    },
    deleteComment: {
        handler: async function(request, h) {
            const userid = request.auth.credentials.id;
            const commentId = request.params.id;
            const comment = await Place.commentsDb.findById(commentId);
            const place = await Place.placeDb.findById(comment.place).lean();
            await comment.remove();
            const placeInfo = await Places.loadPlaceInfo(place._id,userid);
            return h.view("place", { 
                place: placeInfo.place, 
                reviews: placeInfo.reviews, 
                user: placeInfo.loggedInUser, 
                comments: placeInfo.comments } );                      
        }
    },
    deleteReply: {
        handler: async function(request, h) {
            const userid = request.auth.credentials.id;
            const replyId = request.params.id;
            const replyInfo = await Social.getCommentAndReplyIndex(replyId);
            const comment = replyInfo.comment;
            const index = replyInfo.replyIndex;
            comment.replies[index].remove();
            await comment.save();
            const place = await Place.placeDb.findById(comment.place).lean();
            const placeInfo = await Places.loadPlaceInfo(place._id,userid);
            return h.view("place", { 
                place: placeInfo.place, 
                reviews: placeInfo.reviews, 
                user: placeInfo.loggedInUser, 
                comments: placeInfo.comments } );                      
        }
    },
    async getCommentAndReplyIndex(replyId) {
        var returnedComment = null;
        var replyIndex = null;
        const comments = await Place.commentsDb.find({});
        comments.forEach(function(comment){
            const replies = comment.replies;
            for(let i = 0; i < replies.length; i++){
                if(replies[i]._id == replyId){
                    returnedComment = comment;
                    replyIndex = i;
                }
            }
        })
        return( { comment: returnedComment, replyIndex: replyIndex });
    },
    getDateAndTime() {
        const d = new Date();
        let date = d.getDate().toString();
        let month = (d.getMonth()+1).toString();
        let hours = d.getHours().toString();
        let mins = d.getMinutes().toString();
        let secs = d.getSeconds().toString();
        if(date.length == 1){
            date = "0" + date; 
        }
        if(month.length == 1){
            month = "0" + month; 
        }
        if(hours.length == 1){
            hours = "0" + hours; 
        }
        if(mins.length == 1){
            mins = "0" + mins; 
        }
        if(secs.length == 1){
            secs = "0" + secs; 
        }
        const currentDateAndTime = date + "/" + month + "/" + d.getFullYear()
                                    + " " + hours + ":" + mins + ":" + secs;
        return currentDateAndTime;
    }
};


module.exports = Social;