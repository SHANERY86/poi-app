const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const placeSchema = new Schema({
    name: String,
    description: String,
    image: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});

module.exports = Mongoose.model("Place", placeSchema);