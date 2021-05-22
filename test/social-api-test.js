"use strict";

const assert = require("chai").assert;
const POIService = require("./poi-service.js");
const fixtures = require("./fixtures.json");
const _ = require("lodash");
const Social = require("../app/controllers/social");

suite("Social API tests", function ()  {
    let places = fixtures.places;
    let users = fixtures.users;
    let newUser = fixtures.newUser;

    const poiService = new POIService(fixtures.appHost);

    suiteSetup(async function () {
        await poiService.deleteAllUsers();
        const returnedUser = await poiService.createUser(newUser);
        const response = await poiService.authenticate(newUser);
      });
    
      suiteTeardown(async function () {
        await poiService.deleteAllUsers();
        poiService.clearAuth();
      }) 

    setup(async function () {
        await poiService.deleteAllPlaces();
        await poiService.deleteAllRatings();
        await poiService.deleteAllReviews();
        await poiService.deleteAllComments();
    });

    teardown(async function () {
        await poiService.deleteAllPlaces();
        await poiService.deleteAllRatings();
        await poiService.deleteAllReviews();
        await poiService.deleteAllComments();
    });

    test("Make a rating", async function () {
        const u1 = await poiService.createUser(users[0]);
        const p1 = await poiService.createPlace(u1._id,places[0]);
        const ratingval = 5;
        const rating = {
            user: u1,
            place: p1,
            rating: ratingval
        }
        const r1 = await poiService.setRating(p1._id,rating);
        const ratings = await poiService.getRatings();
        assert.equal(ratings.length, 1);
        assert.equal(ratings[0].rating, r1.rating);
    });

    test("Make a review", async function () {
        const u1 = await poiService.createUser(users[0]);
        const p1 = await poiService.createPlace(u1._id,places[0]);
        const reviewContent = "I really like this place";
        const dateAndTime = Social.getDateAndTime();
        const review = {
            user: u1,
            username: u1.name,
            place: p1,
            review: reviewContent,
            dateAndTime: dateAndTime
        }
        const returnedReview = await poiService.makeReview(review);
        const reviews = await poiService.getReviews();
        assert.equal(reviews.length, 1);
        assert.equal(reviews[0].review, review.review);
    })

    test("Edit a review", async function () {
        const u1 = await poiService.createUser(users[0]);
        const p1 = await poiService.createPlace(u1._id,places[0]);
        const reviewContent = "I really like this place";
        const dateAndTime = Social.getDateAndTime();
        const review = {
            user: u1,
            username: u1.name,
            place: p1,
            review: reviewContent,
            dateAndTime: dateAndTime
        }
        const returnedReview = await poiService.makeReview(review);
        const reviews = await poiService.getReviews();
        assert.equal(reviews.length, 1);
        assert.equal(reviews[0].review, review.review);

        const reviewEdit = { edit:"I think I have changed my mind, its not so good" }
        const editedReview = await poiService.editReview(returnedReview._id,reviewEdit);
        const newReview = await poiService.getReview(returnedReview._id);

        assert.equal(newReview.review,reviewEdit.edit);
    })
   
    test("Delete a review", async function () {
        const u1 = await poiService.createUser(users[0]);
        const p1 = await poiService.createPlace(u1._id,places[0]);
        const reviewContent = "I really like this place";
        const dateAndTime = Social.getDateAndTime();
        const review = {
            user: u1,
            username: u1.name,
            place: p1,
            review: reviewContent,
            dateAndTime: dateAndTime
        }
        const returnedReview = await poiService.makeReview(review);
        let reviews = await poiService.getReviews();
        assert.equal(reviews.length, 1);
        assert.equal(reviews[0].review, review.review);

        const response = await poiService.deleteReview(returnedReview._id);
        assert.isDefined(response.success);

        reviews = await poiService.getReviews();
        assert.equal(reviews.length, 0);
    })

    test("Make a comment and a reply", async function () {
        const u1 = await poiService.createUser(users[0]);
        const p1 = await poiService.createPlace(u1._id,places[0]);
        const commentContent = "comment";
        let dateAndTime = Social.getDateAndTime();
        const comment = {
            user: u1,
            username: u1.name,
            place: p1,
            comment: commentContent,
            dateAndTime: dateAndTime
        }
        const returnedComment = await poiService.makeComment(comment);
        const comments = await poiService.getAllComments();
        assert.equal(comments.length, 1);
        assert.equal(comments[0].comment, comment.comment);
        dateAndTime = Social.getDateAndTime();
        const reply = {
            user: u1,
            username: u1.name,
            reply: "reply",
            dateAndTime: dateAndTime
        }
        const commentAfterReply = await poiService.makeReply(returnedComment._id,reply);

        assert.isDefined(commentAfterReply.replies[0]);
        assert.equal(commentAfterReply.replies[0].reply,reply.reply);

    })

    test("Edit a comment and a reply", async function () {
        const u1 = await poiService.createUser(users[0]);
        const p1 = await poiService.createPlace(u1._id,places[0]);
        const commentContent = "comment";
        let dateAndTime = Social.getDateAndTime();
        const comment = {
            user: u1,
            username: u1.name,
            place: p1,
            comment: commentContent,
            dateAndTime: dateAndTime
        }
        const returnedComment = await poiService.makeComment(comment);
        const comments = await poiService.getAllComments();
        assert.equal(comments.length, 1);
        assert.equal(comments[0].comment, comment.comment);

        const commentEdit = { edit: "new comment" };
        const commentAfterEdit = await poiService.editComment(returnedComment._id,commentEdit);

        assert.equal(commentAfterEdit.comment,commentEdit.edit);       

        dateAndTime = Social.getDateAndTime();
        const reply = {
            user: u1,
            username: u1.name,
            reply: "reply",
            dateAndTime: dateAndTime
        }
        const commentAfterReply = await poiService.makeReply(returnedComment._id,reply);

        assert.isDefined(commentAfterReply.replies[0]);
        assert.equal(commentAfterReply.replies[0].reply,reply.reply);     
        
        const replyId = commentAfterReply.replies[0]._id;
        const replyEdit = { edit: "new reply" };
        const commentAfterReplyEdit = await poiService.editReply(replyId,replyEdit);
        assert.equal(commentAfterReplyEdit.replies[0].reply,replyEdit.edit);
    })

    test("Delete a comment and a reply", async function() {
        const u1 = await poiService.createUser(users[0]);
        const p1 = await poiService.createPlace(u1._id,places[0]);
        const commentContent = "comment";
        let dateAndTime = Social.getDateAndTime();
        const comment = {
            user: u1,
            username: u1.name,
            place: p1,
            comment: commentContent,
            dateAndTime: dateAndTime
        }
        const returnedComment = await poiService.makeComment(comment);
        const comments = await poiService.getAllComments();
        assert.equal(comments.length, 1);
        assert.equal(comments[0].comment, comment.comment);
        dateAndTime = Social.getDateAndTime();
        const reply = {
            user: u1,
            username: u1.name,
            reply: "reply",
            dateAndTime: dateAndTime
        }
        const commentAfterReply = await poiService.makeReply(returnedComment._id,reply);

        assert.isDefined(commentAfterReply.replies[0]);
        assert.equal(commentAfterReply.replies[0].reply,reply.reply);
        
        const replyId = commentAfterReply.replies[0]._id;
        await poiService.deleteReply(replyId);
        const commentAfterReplyDelete = await poiService.getComment(commentAfterReply._id);
        assert.equal(commentAfterReplyDelete.replies.length,0);

        await poiService.deleteComment(commentAfterReplyDelete._id);
        const commentsAfterDelete = await poiService.getAllComments();
        assert.equal(commentsAfterDelete.length,0);
    })

});