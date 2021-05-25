const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const placeSchema = new Schema({
    name: String,
    description: String,
    image: String,
    category: String,
    lat: Number,
    long: Number,
    temp: Number,
    feelsLike: Number,
    clouds: String,
    windSpeed: String,
    humidity: Number,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    username: String,
    useremail: String,
    rating: Number,
    numberOfRatings: {
        type: Number,
        default: 0
    },
    social: Schema.Types.Boolean
},
{ versionKey: false });

const categorySchema = new Schema({
    name: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});

const ratingSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    place: {
        type: Schema.Types.ObjectId,
        ref: "Place"
    },
    rating: Number,
})

const reviewSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    username: String,
    place: {
        type: Schema.Types.ObjectId,
        ref: "Place"
    },
    review: String,
    dateAndTime: String
})

const commentsSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    username: String,
    place: {
        type: Schema.Types.ObjectId,
        ref: "Place"
    },
    comment: String,
    dateAndTime: String,
    replies: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        commentId: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
        },
        username: String,
        reply: String,
        dateAndTime: String,
    }]
})

const eventSchema = new Schema({
    type: String,
    refid: String,
    dateAndTime: String,
    utc: Number,
    dayAndMonth: String,
    content: String,
    place: {
        id: { 
            type: Schema.Types.ObjectId,
            ref: "Place"
        },
        name: String,
        image: String,
    },
    username: String,
})

placeSchema.statics.findAll = function() {
    return this.find({});
  }

categorySchema.statics.findAll = function() {
    return this.find({});
  }

ratingSchema.statics.findAll = function() {
    return this.find({});
  }

reviewSchema.statics.findAll = function() {
    return this.find({});
}

commentsSchema.statics.findAll = function() {
    return this.find({});
}

eventSchema.statics.findAll = function() {
    return this.find({});
}


const placeDb = Mongoose.model("Place", placeSchema);
const categoryDb = Mongoose.model("Category", categorySchema); 
const ratingDb = Mongoose.model("Rating", ratingSchema);
const reviewDb = Mongoose.model("Review", reviewSchema);
const commentsDb = Mongoose.model("Comments", commentsSchema);
const eventDb = Mongoose.model("Event", eventSchema);

module.exports = { 
            placeDb,
            categoryDb,
            ratingDb,
            reviewDb,
            commentsDb,
            eventDb
};