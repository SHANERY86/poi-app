const { number } = require("@hapi/joi");
const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const placeSchema = new Schema({
    name: String,
    description: String,
    image: String,
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category"
    },
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
    }
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
    rating: Number
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


const placeDb = Mongoose.model("Place", placeSchema);
const categoryDb = Mongoose.model("Category", categorySchema); 
const ratingDb = Mongoose.model("Rating", ratingSchema);

module.exports = { 
            placeDb,
            categoryDb,
            ratingDb
};