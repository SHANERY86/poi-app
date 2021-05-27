"use strict";

const Place = require("../models/place");
const User = require("../models/user");
const Places = require("./places");
const Boom = require('@hapi/boom');
const sanitizeHtml = require('sanitize-html');

const Social = {
    rating: {
        handler: async function (request, h) {
            const userid = request.auth.credentials.id;
            try{
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
                const ratingEvent = await Place.eventDb.find( { type:"gave a rating", username: user.name, "place.id": place._id } );
                if(ratingEvent[0]){
                await ratingEvent[0].remove();
                }
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
             const dateAndTime = Social.getDateAndTime();
             const event = new Place.eventDb({
                 type: "gave a rating",
                 dateAndTime: dateAndTime.dateAndTime,
                 utc: dateAndTime.utc,
                 dayAndMonth: dateAndTime.dayAndMonth,
                 content: request.payload.rating.toString() + " out of 5.0",
                 place: {
                     id: placeId,
                     name: place.name,
                     image: place.image,
                 },
                 username: user.name
             })
             event.save();
             const placeInfo = await Social.loadPlaceInfo(placeId,user._id);
             return h.view("place", { 
                 place: placeInfo.place, 
                 reviews: placeInfo.reviews, 
                 user: placeInfo.loggedInUser, 
                 comments: placeInfo.comments, social:true } );   
             }
             catch (err) {
                return h.view("errorpage", { errors: [{ message: err.message }] });                
             }     
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
            const userid = request.auth.credentials.id;
            try{
            const place = await Place.placeDb.findById(placeId);
            const user = await User.findById(userid);
            const currentDateAndTime = Social.getDateAndTime();
            const inputReview = request.payload.review;
            const sanitizedReview = sanitizeHtml(inputReview);
            let sanitizedShortReview = "";
            if (sanitizedReview.length > 300){
             sanitizedShortReview = sanitizedReview.substring(0,300) + "....";
            }
            if (sanitizedReview.length <= 300){
                sanitizedShortReview = sanitizedReview;
            }
            if(sanitizedReview == ""){
                const message = "Your review has been blocked for security reasons";
                throw Boom.badData(message);
            } 
            const review = new Place.reviewDb({
                userId: userid,
                username: user.name,
                place: place,
                review: sanitizedReview,
                dateAndTime: currentDateAndTime.dateAndTime,
            })
            await review.save();
            const event = new Place.eventDb({
                type: "submitted a review",
                refid: review._id,
                dateAndTime: currentDateAndTime.dateAndTime,
                dayAndMonth: currentDateAndTime.dayAndMonth,
                utc: currentDateAndTime.utc,
                content: sanitizedShortReview,
                place: {
                    id: placeId,
                    name: place.name,
                    image: place.image,
                },
                username: user.name
            })
            event.save();
            const placeInfo = await Social.loadPlaceInfo(placeId,user._id);
            return h.view("place", { 
                place: placeInfo.place, 
                reviews: placeInfo.reviews, 
                user: placeInfo.loggedInUser, 
                comments: placeInfo.comments, social:true } );      
            }
            catch (err) {
                return h.view("errorpage", {
                    errors: [{ message: err.message }] });          
            } 
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
            const user = User.findById(userid);
            const reviewId = request.params.id;
            try{
            const review = await Place.reviewDb.findById( { _id: reviewId });
            const reviewEdit = request.payload.review;
            const sanitisedEdit = sanitizeHtml(reviewEdit);
            if(sanitisedEdit == ""){
                const message = "Your review has been blocked for security reasons";
                throw Boom.badData(message);
            } 
            let sanitisedShortEdit = "";
            if (sanitisedEdit.length > 300){
                sanitisedShortEdit = sanitisedEdit.substring(0,300) + "....";
               }
               if (sanitizedReview.length <= 300){
                   sanitisedShortEdit = sanitisedEdit;
               }
            review.review = sanitisedEdit + " (edited)";
            const oldEvent = await Place.eventDb.find( { refid: review._id } );
            if (oldEvent[0]){
            await oldEvent[0].remove();
            }
            const placeId = review.place;
            const place = await Place.placeDb.findById(placeId);
            const currentDateAndTime = Social.getDateAndTime();
            const event = new Place.eventDb({
                type: "edited a review",
                refid: review._id,
                dateAndTime: currentDateAndTime.dateAndTime,
                dayAndMonth: currentDateAndTime.dayAndMonth,
                utc: currentDateAndTime.utc,
                content: sanitisedShortEdit,
                place: {
                    id: placeId,
                    name: place.name,
                    image: place.image,
                },
                username: user.name                
            })
            event.save();
            await review.save();
            const placeInfo = await Social.loadPlaceInfo(placeId,userid);           
            return h.view("place", { 
                place: placeInfo.place, 
                reviews: placeInfo.reviews, 
                user: placeInfo.loggedInUser, 
                comments: placeInfo.comments, social:true } );      
            }
            catch (err) {
                return h.view("errorpage", {
                    errors: [{ message: err.message }] });          
            }               
        }
    },
    deleteReview: {
        handler: async function(request, h) {
            try{
            const userid = request.auth.credentials.id;            
            const review = await Place.reviewDb.findById( { _id: request.params.id } );
            const placeId = review.place;
            const reviewEvent = await Place.eventDb.find( { refid: review._id } );
            if (reviewEvent[0]){
            reviewEvent[0].remove();
            }
            await review.remove();
            const placeInfo = await Social.loadPlaceInfo(placeId,userid);
            return h.view("place", { 
                place: placeInfo.place, 
                reviews: placeInfo.reviews, 
                user: placeInfo.loggedInUser, 
                comments: placeInfo.comments, social:true } );        
            }
            catch (err) {
                return h.view("errorpage", {
                    errors: [{ message: err.message }] });               
            }
        }          
    },
    addComment: {
        handler: async function(request, h) {
            try{
            const user = await User.findById(request.auth.credentials.id);
            const placeId = request.params.id;
            const place = await Place.placeDb.findById(placeId);
            const input = request.payload.comment;
            const sanitisedInput = sanitizeHtml(input);
            if(sanitisedInput == ""){
                const message = "Your comment was blocked for security reasons";
                throw Boom.badData(message);
            }
            let sanitisedShortInput = "";
            if (sanitisedInput.length > 300){
                sanitisedShortInput = sanitisedInput.substring(0,300) + "....";
               }
               if (sanitisedInput.length <= 300){
                   sanitisedShortInput = sanitisedInput;
               }
            const currentDateAndTime = Social.getDateAndTime();
            const comment = new Place.commentsDb({
                userId: user._id,
                username: user.name,
                place: place,
                comment: sanitisedInput,
                dateAndTime: currentDateAndTime.dateAndTime,
            })
            await comment.save();
            const event = new Place.eventDb({
                type: "made a comment",
                refid: comment._id,
                dateAndTime: currentDateAndTime.dateAndTime,
                utc: currentDateAndTime.utc,
                dayAndMonth: currentDateAndTime.dayAndMonth,
                content: sanitisedShortInput,
                place: {
                    id: placeId,
                    name: place.name,
                    image: place.image,
                },
                username: user.name
            })
            event.save();
            const placeInfo = await Social.loadPlaceInfo(placeId,user._id);
            return h.view("place", { 
                place: placeInfo.place, 
                reviews: placeInfo.reviews, 
                user: placeInfo.loggedInUser, 
                comments: placeInfo.comments, social:true } );        
            }
            catch(err){
                return h.view("errorpage", {
                    errors: [{ message: err.message }] });          
            }      
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
            try{
            const inputId = request.params.id;
            const comment = await Place.commentsDb.findById(inputId);
            var commentForLoading = null;
            const userid = request.auth.credentials.id;
            const user = await User.findById(userid);
            if(comment){
            const dateAndTime = Social.getDateAndTime();
            const input = request.payload.reply;
            const sanitisedInput = sanitizeHtml(input);
            if(sanitisedInput == ""){
                const message = "Your comment was blocked for security reasons";
                throw Boom.badData(message);
            }            
            const reply = {
                userId: userid,
                username: user.name,
                reply: sanitisedInput,
                dateAndTime: dateAndTime.dateAndTime
            }
            var replies = comment.replies;
            replies.push(reply);
            const replyid = replies[replies.length - 1]._id;
            await comment.save();
            const place = await Place.placeDb.findById( comment.place ).lean();
            let sanitisedShortInput = "";
            if (sanitisedInput.length > 300){
                sanitisedShortInput = sanitisedInput.substring(0,300) + "....";
               }
               if (sanitisedInput.length <= 300){
                   sanitisedShortInput = sanitisedInput;
               }
            const event = new Place.eventDb({
                type: "replied",
                refid: replyid,
                dateAndTime: dateAndTime.dateAndTime,
                utc: dateAndTime.utc,
                dayAndMonth: dateAndTime.dayAndMonth,
                content: sanitisedShortInput,
                place: {
                    id: place._id,
                    name: place.name,
                    image: place.image,
                },
                username: user.name
            })
            await event.save();
            commentForLoading = comment;
            }
            if(!comment){
                const replyInfo = await Social.getCommentAndReplyIndex(inputId);
                const returnedComment = replyInfo.comment;
                const commentToUpdate = await Place.commentsDb.findById(returnedComment._id);
                const dateAndTime = Social.getDateAndTime();
                const input = request.payload.reply;
                const sanitisedInput = sanitizeHtml(input);
                if(sanitisedInput == ""){
                    const message = "Your comment was blocked for security reasons";
                    throw Boom.badData(message);
                }            
                const reply = {
                    userId: userid,
                    username: user.name,
                    reply: sanitisedInput,
                    dateAndTime: dateAndTime.dateAndTime
                }
                commentToUpdate.replies.push(reply);
                await commentToUpdate.save(); 
                const replies = commentToUpdate.replies; 
                const replyid = replies[replies.length - 1]._id;
                const place = await Place.placeDb.findById( commentToUpdate.place ).lean();
                let sanitisedShortInput = "";
                if (sanitisedInput.length > 300){
                    sanitisedShortInput = sanitisedInput.substring(0,300) + "....";
                   }
                   if (sanitisedInput.length <= 300){
                       sanitisedShortInput = sanitisedInput;
                   }
                const event = new Place.eventDb({
                    type: "replied",
                    refid: replyid,
                    dateAndTime: dateAndTime.dateAndTime,
                    utc: dateAndTime.utc,
                    dayAndMonth: dateAndTime.dayAndMonth,
                    content: sanitisedShortInput,
                    place: {
                        id: place._id,
                        name: place.name,
                        image: place.image,
                    },
                    username: user.name
                })
                await event.save();            
                commentForLoading = commentToUpdate;
            }
            const placeInfo = await Social.loadPlaceInfo(commentForLoading.place,user._id);
            return h.view("place", { 
                place: placeInfo.place, 
                reviews: placeInfo.reviews, 
                user: placeInfo.loggedInUser, 
                comments: placeInfo.comments, social:true } );        
        } catch (err) {
            return h.view("errorpage", {
                errors: [{ message: err.message }] });          
        }               
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
            try{
            const userid = request.auth.credentials.id;
            const user = await User.findById(userid);
            const inputId = request.params.id;
            var commentForLoading = null;
            const comment = await Place.commentsDb.findById(inputId);
            if(comment){
            const input = request.payload.comment;
            const sanitisedInput = sanitizeHtml(input);
            if(sanitisedInput == ""){
                const message = "Your comment edit was blocked for security reasons";
                throw Boom.badData(message);
            }             
            comment.comment = sanitisedInput;
            await comment.save();
            const oldEvent = await Place.eventDb.find( { refid: comment._id } );
            if(oldEvent[0]){
            await oldEvent[0].remove();
            }
            const currentDateAndTime = Social.getDateAndTime();
            const place = await Place.placeDb.findById(comment.place);
            let sanitisedShortInput = "";
            if (sanitisedInput.length > 300){
                sanitisedShortInput = sanitisedInput.substring(0,300) + "....";
               }
               if (sanitisedInput.length <= 300){
                   sanitisedShortInput = sanitisedInput;
               }
            const event = new Place.eventDb({
                type: "edited a comment",
                refid: comment._id,
                dateAndTime: currentDateAndTime.dateAndTime,
                dayAndMonth: currentDateAndTime.dayAndMonth,
                utc: currentDateAndTime.utc,
                content: sanitisedShortInput,
                place: {
                    id: comment.place,
                    name: place.name,
                    image: place.image,
                },
                username: user.name                
            })
            event.save();
            commentForLoading = await Place.commentsDb.findById(comment._id).lean();
            } 
            if(!comment){
                const replyInfo = await Social.getCommentAndReplyIndex(inputId);
                const returnedComment = replyInfo.comment;
                const index = replyInfo.replyIndex;
                const commentToUpdate = await Place.commentsDb.findById(returnedComment._id);
                const input = request.payload.reply;
                const sanitisedInput = sanitizeHtml(input);
                if(sanitisedInput == ""){
                    const message = "Your comment edit was blocked for security reasons";
                    throw Boom.badData(message);
                }   
                commentToUpdate.replies[index].reply = sanitisedInput;
                await commentToUpdate.save();
                const replyId = returnedComment.replies[index]._id;
                const place = await Place.placeDb.findById(returnedComment.place);
                const oldEvent = await Place.eventDb.find( { refid: replyId } );
                const currentDateAndTime = Social.getDateAndTime();
                if(oldEvent[0]){
                await oldEvent[0].remove();
                }
                let sanitisedShortInput = "";
                if (sanitisedInput.length > 300){
                    sanitisedShortInput = sanitisedInput.substring(0,300) + "....";
                   }
                   if (sanitisedInput.length <= 300){
                       sanitisedShortInput = sanitisedInput;
                   }
                const event = new Place.eventDb({
                    type: "replied",
                    refid: replyId,
                    dateAndTime: currentDateAndTime.dateAndTime,
                    dayAndMonth: currentDateAndTime.dayAndMonth,
                    utc: currentDateAndTime.utc,
                    content: sanitisedShortInput,
                    place: {
                        id: returnedComment.place,
                        name: place.name,
                        image: place.image,
                    },
                    username: user.name                
                })
                event.save();                
                commentForLoading = await Place.commentsDb.findById(commentToUpdate._id).lean();                         
            }           
            const placeInfo = await Social.loadPlaceInfo(commentForLoading.place,userid);
            return h.view("place", { 
                place: placeInfo.place, 
                reviews: placeInfo.reviews, 
                user: placeInfo.loggedInUser, 
                comments: placeInfo.comments, social:true } );      
            } catch (err) {
                return h.view("errorpage", {
                    errors: [{ message: err.message }] });                  
            }    
        }
    },
    deleteComment: {
        handler: async function(request, h) {
            try{
            const userid = request.auth.credentials.id;
            const commentId = request.params.id;
            const comment = await Place.commentsDb.findById(commentId);
            const place = await Place.placeDb.findById(comment.place).lean();
            const event = await Place.eventDb.find( { refid: comment._id } );
            await comment.remove();
            if(event[0]){
            await event[0].remove();
            }
            const placeInfo = await Social.loadPlaceInfo(place._id,userid);
            return h.view("place", { 
                place: placeInfo.place, 
                reviews: placeInfo.reviews, 
                user: placeInfo.loggedInUser, 
                comments: placeInfo.comments, social:true } );      
            } catch (err) {
                return h.view("errorpage", {
                    errors: [{ message: err.message }] });               
            }                
        }
    },
    deleteReply: {
        handler: async function(request, h) {
            try{
            const userid = request.auth.credentials.id;
            const replyId = request.params.id;
            const replyInfo = await Social.getCommentAndReplyIndex(replyId);
            const comment = replyInfo.comment;
            const index = replyInfo.replyIndex;
            comment.replies[index].remove();
            await comment.save();
            const place = await Place.placeDb.findById(comment.place).lean();
            const placeInfo = await Social.loadPlaceInfo(place._id,userid);
            return h.view("place", { 
                place: placeInfo.place, 
                reviews: placeInfo.reviews, 
                user: placeInfo.loggedInUser, 
                comments: placeInfo.comments, social:true } ); 
            }  catch (err) {
                return h.view("errorpage", {
                    errors: [{ message: err.message }] });               
            }                      
        }
    },
    async loadPlaceInfo(placeId, loggedInUserId) {
        const place = await Place.placeDb.findById(placeId).lean();
        const user = await User.findById(loggedInUserId).lean();
        const placeReviews = await Place.reviewDb.find( { place: place }).lean();
        const placeComments = await Place.commentsDb.find( { place: place }).lean();
        const placeInfo = {
            place: place,
            loggedInUser: user,
            reviews: placeReviews,
            comments: placeComments
        }
        return placeInfo;
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
//      const d = new Date(2021,4,23,0,0,0);
      const d = new Date();
        const d2 = d.toDateString();
        const dayAndMonth = d2.substring(0, d2.length - 4);
        const utc = d/1000;
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
        return { 
            dateAndTime: currentDateAndTime,
            utc: utc,
            dayAndMonth: dayAndMonth
        }
    }
};


module.exports = Social;