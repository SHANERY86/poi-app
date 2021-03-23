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
    humidity: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});

const categorySchema = new Schema({
    name: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});

placeSchema.statics.findAll = function() {
    return this.find({});
  }

categorySchema.statics.findAll = function() {
    return this.find({});
  }


const placeDb = Mongoose.model("Place", placeSchema);
const categoryDb = Mongoose.model("Category", categorySchema); 

module.exports = { 
            placeDb,
            categoryDb
};