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
            const newPlace = new Place.placeDb({
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
            const places = await Place.placeDb.find({ user: user._id }).lean();                
            return h.view("places", { places: places, });           
        }
    },
    adminPlaces: {
        handler: async function (request, h) {
            const id = request.params._id;
            const user = await User.findById(id).lean();
            const places = await Place.placeDb.find({ user: user._id }).lean();                
            return h.view("adminplaces", { places: places, user: user });            
        }
    }, 
    placesByCategory: {
        handler: async function (request, h) {
            const categoryId = request.params._id; 
            const category = await Place.categoryDb.find({ _id: categoryId });
            const placesInCategory = await Place.placeDb.find({ category: category[0].name }).lean();
            return h.view("places", { places: placesInCategory });          
        }
    },
    showPlace: {
        handler: async function (request, h) {
            const userid = request.auth.credentials.id;
            const user = await User.findById(userid);
            const userCategories = await Place.categoryDb.find({ user: user._id }).lean();
            const placeId = request.params._id;
            const place = await Place.placeDb.findById(placeId).lean();
            return h.view("editplace", { place: place, categories: userCategories })
        }
    },
    adminShowPlace: {
        handler: async function (request, h) {
            const placeId = request.params._id;
            const place = await Place.placeDb.findById(placeId).lean();
            const user = await User.findById(place.user).lean();
            return h.view("admineditplace", { place: place , user: user })
        }
    },    
    editPlace: {
        handler: async function (request, h) {
            const placeId = request.params._id;
            const newData = request.payload;
            const place = await Place.placeDb.findById(placeId);
            const imageId = await ImageStore.getImageId(place.image);
            place.name = newData.name;
            place.description = newData.description;
            place.category = newData.category;
            const imageFile = request.payload.imagefile;
            if (Object.keys(imageFile).length > 0) {
            await ImageStore.deleteImage(imageId);
            newImageUrl = await ImageStore.uploadImage(imageFile);
            place.image = newImageUrl;
            }
            await place.save();
            return h.redirect("/places");
        },
        payload: {
            multipart: true,
            output: 'data',
            maxBytes: 209715200,
            parse: true
          }
    },
    adminEditPlace: {
        handler: async function (request, h) {
            const placeId = request.params._id;
            const newData = request.payload;
            const place = await Place.placeDb.findById(placeId);
            place.name = newData.name;
            place.description = newData.description;
            place.category = newData.category;
            await place.save();
            const user = await User.findById(place.user).lean();
            const places = await Place.placeDb.find({ user: user._id }).lean(); 
            return h.view("adminplaces", { places: places, user: user });        
        }
    },        
    deletePlace: {
        handler: async function (request, h) {
            const placeId = request.params._id;
            const place = await Place.placeDb.findById(placeId);
            const imageId = await ImageStore.getImageId(place.image);
            await ImageStore.deleteImage(imageId);
            await place.remove();
            return h.redirect("/places");
        }
    },
    adminDeletePlace: {
        handler: async function (request, h) {
            const placeId = request.params._id;
            const place = await Place.placeDb.findById(placeId);
            const imageId = await ImageStore.getImageId(place.url);
            await ImageStore.deleteImage(imageId);
            const user = await User.findById(place.user).lean();
            await place.remove();
            const places = await Place.placeDb.find({ user: user._id }).lean(); 
            return h.view("adminplaces", { places: places, user: user });        
        }
    },
    category: {
        handler: async function (request, h) {
            const userid = request.auth.credentials.id;
            const user = await User.findById(userid);
            const userCategories = await Place.categoryDb.find({ user: user._id }).lean();
            return h.view("category", { categories: userCategories });
        }
    },
    addCategory: {
        handler: async function (request, h) {
            const userid = request.auth.credentials.id;
            const user = await User.findById(userid);
            data = request.payload.category;
            const newCategory = new Place.categoryDb({
                name: data,
                user: user
            })
            await newCategory.save();
            return h.redirect("/category");
        }
    }
};

module.exports = Places;