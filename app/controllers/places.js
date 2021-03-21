const Place = require("../models/place");
const User = require("../models/user");
const ImageStore = require("../utils/image-store");

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
            const imageFile = request.payload.imagefile;
            if (Object.keys(imageFile).length > 0) {
            imageUrl = await ImageStore.uploadImage(imageFile);
            }
            else{
                imageUrl = "https://res.cloudinary.com/djmtnizt7/image/upload/v1615932577/globe_binoc_ejxjwj.png"
            }
            const newPlace = new Place({
                name: data.name,
                description: data.description,
                user: user._id,
                image: imageUrl
            });
            await newPlace.save();
            return h.redirect("/places");
        } catch(err) {
            return h.view("addplaces", { errors: [{ message: err.message }] });
        }
    },
    payload: {
        multipart: true,
        output: 'data',
        maxBytes: 209715200,
        parse: true
      }
    },
    places: {
        handler: async function (request, h) {
            const id = request.auth.credentials.id;
            const user = await User.findById(id);           
            const places = await Place.find({ user: user._id }).lean();
            return h.view("places", { places: places, });           
        }
    },
    showPlace: {
        handler: async function (request, h) {
            const placeId = request.params._id;
            const place = await Place.findById(placeId).lean();
            return h.view("editplace", { place: place, })
        }
    },
    editPlace: {
        handler: async function (request, h) {
            const placeId = request.params._id;
            const newData = request.payload;
            const place = await Place.findById(placeId);
            place.name = newData.name;
            place.description = newData.description;
            await place.save();
            return h.redirect("/places");
    }
},
    deletePlace: {
        handler: async function (request, h) {
            const placeId = request.params._id;
            const place = await Place.findById(placeId);
            await place.remove();
            return h.redirect("/places");
        }
    }
};

module.exports = Places;