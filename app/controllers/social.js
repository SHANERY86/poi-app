"use strict";

const Place = require("../models/place");
const User = require("../models/user");
const Places = require("./places");
const Boom = require('@hapi/boom');
const sanitizeHtml = require('sanitize-html');

const Social = {
    //this method submits a rating for a POI
    rating: {
        handler: async function (request, h) {
            const userid = request.auth.credentials.id;
            try{
            const user = await User.findById(userid);
            const placeId = request.params.id;
            const place = await Place.placeDb.findById(placeId).lean();
            const existingRating = await Place.ratingDb.find({ user: user, place: place });  //searches for an existing rating for this place by this user
            const ratingInput = request.payload.rating;
            if(!existingRating[0]){                     //if there is no exisiting rating for this POI by this user, it creates a new rating 
            const rating = new Place.ratingDb({
                user: user,
                place: place,
                rating: ratingInput
             })
             await rating.save();
            }
            if(existingRating[0]){                      //if a user has already rated this POI, it will update the old one instead of making a new one 
                existingRating[0].rating = ratingInput;     //this means a user can only make one rating per POI
                await existingRating[0].save();
                const ratingEvent = await Place.eventDb.find( {  //creates a rating event, which will notify other users of this users rating for this POI
                    type:"gave a rating",                           //this rating event is processed and shown on the notice board when refreshed
                    username: user.name, 
                    "place.id": place._id } 
                ); 
                if(ratingEvent[0]){                 //when a rating has been updated, it will delete the original rating event, so the latest and most up to date rating
                await ratingEvent[0].remove();      // for this user on this POI is shown only. This stop the notice board being cluttered with multiple ratings
                }                                   //for the same thing by the same person.
            }
             const placeRatings = await Place.ratingDb.find( { place: placeId } );          //this block of code is going to average all the ratings for this place
             let ratingstotal = 0;                                                          //so the average can be seen in the ratings card
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
             const event = new Place.eventDb({                                      //this is creating a new rating event, for display on the noticeboard
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
             const placeInfo = await Social.loadPlaceInfo(placeId,user._id);    //this is a function (detailed below) to load all the info about a POI for passing to handlebars
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
    //this will display the page to write a review
    writeReview: {
        handler: async function(request, h) {
            const placeId = request.params.id;
            const placeObj = await Place.placeDb.findById(placeId).lean();
            return h.view("review", { place: placeObj });
        }
    },
    //this will take the review written by a user, process it and display the POI with the new review presented
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
            if (sanitizedReview.length > 300){                                      //this code is generating a trimmed version of the review for display on the 
             sanitizedShortReview = sanitizedReview.substring(0,300) + "....";      //noticeboard, if the review is more than 300 characters long
            }
            if (sanitizedReview.length <= 300){
                sanitizedShortReview = sanitizedReview;
            }
            if(sanitizedReview == ""){                                              //does not allow a blank review to be submitted if the sanitised version is blank
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
            const event = new Place.eventDb({                                   //new review event created for the noticeboard
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
            if (reviewEvent[0]){                                                       //if a review is deleted, the review event is also deleted
            reviewEvent[0].remove();                                                    //keeping the noticeboard free of content that no longer exists
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
    //I have implemented a sort of overcomplicated way of presenting the user with the comment or reply that they are replying to
    //I set up the replying functionality to send the user to a new page, with the comment they are replying to on display as they type.
    //it is probably simpler and neater to have a text box appear at the bottom with a click, but I need to learn how to do that yet..
    //the 'reply' hbs page has two conditional states, one for replying to comments and another for replying to replies, to avoid making another unnecessary file
    //the form in the comment conditional state will generate a reply for a primary or top comment
    //this method below will return the 'reply' page in the comment conditional state, meaning that a primary top comment was selected for reply
    //when a user selects a reply to reply to, the replies are stored in an array inside the comment object, meaning it needs to be accessed in a different way
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
                const comments = await Place.commentsDb.find({}).lean();           //to allow the user to view the reply while they are responding..
                comments.forEach(function(comment){                                 //I made it so a new page loads displaying the reply..
                    const replies = comment.replies;                                //the replies are an array within a comment object
                    for(let i = 0; i < replies.length; i++){                        //this code is iterating through the comments, and the replies within the comments..
                        if(replies[i]._id == replyId){                              //to find the right reply to display
                            reply = replies[i];                                     //there is probably a neater way to do this with mongoose, but this works for now
                        }                                                           //it will display the 'editcomment' page, with a reply object sent to it
                    }                                                               //meaning it will load this page in the appropriate conditional dependant state  
                })                                                                  //the 'editcomment' hbs page is used to edit both commments and replies
                return h.view("editcomment", { reply: reply } ); 
            }   
    },
    replyToReplyView: {                                                             
        handler: async function(request, h) {                               //because a reply is an array inside a comment object there must be a separate method..
            const replyId = request.params.id;                              //to display the appropriate reply, when replying to a reply.
            var reply = null;                                               //then this method will return the 'reply' hbs with a form that will generate a reply for a..
            const comments = await Place.commentsDb.find({}).lean();        //reply within a comment
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
    //this method below will process the reply and save it. It checks the input id to see if it is a reply to a reply or a reply to a comment
    //if it is a reply to a comment, it creates a new comment object, if its a reply, it will push a new reply to the replies array within the appropriate comment object
    addReply: {
        handler: async function(request, h) { 
            try{
            const inputId = request.params.id;
            const comment = await Place.commentsDb.findById(inputId);
            var commentForLoading = null;
            const userid = request.auth.credentials.id;
            const user = await User.findById(userid);

            if(comment){                                        //if the input id is found to be a comment it will process the block below
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
            const event = new Place.eventDb({               // new comment event for the noticeboard
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

            if(!comment){                               //if the input id is not found to be a comment, they are replying to a reply, and the reply is saved a different way
                const replyInfo = await Social.getCommentAndReplyIndex(inputId);  //this returns the comment and index of the reply array for the reply selected (see below)
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
    //displays an edit page for a comment
    editCommentDisplay: {
        handler: async function(request, h) { 
            const commentId = request.params.id;
            const comment = await Place.commentsDb.findById(commentId).lean();
            return h.view("editcomment", { comment: comment } );
        }       
    },
    //similar to 'addReply', this method will check to see if the input id is a comment or a reply and act accordingly
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
            if(oldEvent[0]){                                                        //deletes old event, a new one created below, keeps most up to date info on noticeboard
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
            const event = await Place.eventDb.find( { refid: replyId } );
            if(event[0]){
                await event[0].remove();
                }            
            const place = await Place.placeDb.findById(comment.place).lean();
            const placeInfo = await Social.loadPlaceInfo(place._id,userid);
            return h.view("place", { 
                place: placeInfo.place, 
                reviews: placeInfo.reviews, 
                user: placeInfo.loggedInUser, 
                comments: placeInfo.comments, social: true } ); 
            }  catch (err) {
                return h.view("errorpage", {
                    errors: [{ message: err.message }] });               
            }                      
        }
    },
    //loads all the info needed for displaying info on a single more detailed POI page
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
    //this takes the id of a reply, and puts out its associated comment, and the associated index in the reply array of that comment object
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
    //gets time and date information 
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