const Place = require("../models/place");
const User = require("../models/user")

const Places = {
    home: {
        auth: false,
        handler: function (request, h) {
            return h.view("start");
        }
    },
    addView: {
        handler: function (request, h) {
            return h.view("addplaces");
        }
    },
    add: {
        handler: async function (request, h) {
            try{
            const id = request.auth.credentials.id;
            const user = await User.findById(id);
            const data = request.payload;
            const newPlace = new Place({
                name: data.name,
                description: data.description,
                user: user._id
            });
            await newPlace.save();
            return h.redirect("/places");
        } catch(err) {
            return h.view("addplaces", { errors: [{ message: err.message }] });
        }

          }
    },
    places: {
        handler: async function (request, h) {
            const id = request.auth.credentials.id;
            const user = await User.findById(id);           
            const places = await Place.find({ user: user._id }).lean();
            return h.view("places", { places: places, });           
        }
    }
};

module.exports = Places;