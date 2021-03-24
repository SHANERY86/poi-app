const Place = require("../models/place");
const User = require("../models/user");
const ImageStore = require("../utils/image-store");
const Weather = require("../utils/weather");
const Joi = require('@hapi/joi');

const Places = {
    home: {
        auth: false,
        handler: function (request, h) {
            return h.view("start");
        }
    },
    //this will display the view with the form to add a new POI, it gathers the users categories to display them in the category select drop down menu
    addView: {
        handler: async function (request, h) {
            const id = request.auth.credentials.id;
            var userCategories = await Place.categoryDb.find({ user: id }).lean();
            return h.view("addplaces", { categories: userCategories, } );
        }
    },
    /*this adds a new POI, inputs are validated through Joi, an input for name and description is mandatory, others are optional. If no image is uploaded, a stand in
    image is used. If values for longitude and latitude are entered, a weather report is generated and appended to the POI object. If a category is selected then this 
    is appended to the object also.
    */
    add: {
        validate: {
            payload: {
              name: Joi.string().required(),
              description: Joi.string().required(),
              imagefile: Joi.object().required().optional(),
              latitude: Joi.number().allow(''),
              longitude: Joi.number().allow('')
            },
            options: {
                abortEarly: false,
                allowUnknown: true
              },
            failAction: function (request, h, error) {
              return h
                .view("addplaces", {
                  errors: error.details
                })
                .takeover()
                .code(400);
            },
          }, 
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
                imageUrl = "https://res.cloudinary.com/djmtnizt7/image/upload/v1616502936/globe_binoc_jdgn3n.png"
            }
            const newPlace = new Place.placeDb({
                name: data.name,
                description: data.description,
                user: user._id,
                image: imageUrl
            });
            if(data.category != "None"){
            const categoryInput = data.category;
            try{
            var category = await Place.categoryDb.find({ name: categoryInput, user: id });
            }
            catch(err)
            { console.log(err)
            }
            newPlace.category = category[0]._id;
            }            
            if(data.latitude && data.longitude){
                weatherReport = await Weather.getWeather(data.latitude,data.longitude);
                newPlace.lat = data.latitude;
                newPlace.long = data.longitude;
                newPlace.temp = weatherReport.temp;
                newPlace.feelsLike = weatherReport.feelsLike;
                newPlace.clouds = weatherReport.clouds;
                newPlace.windSpeed = weatherReport.windSpeed;
                newPlace.humidity = weatherReport.humidity; 
            }
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
    //displays the POI list without category filter
    places: {
        handler: async function (request, h) {
            const id = request.auth.credentials.id;
            const user = await User.findById(id);
            const places = await Place.placeDb.find({ user: user._id }).lean();            
            return h.view("places", { places: places, });           
        }
    },
    //displays the POI list for a user as a logged in admin
    adminPlaces: {
        handler: async function (request, h) {
            const id = request.params._id;
            const user = await User.findById(id).lean();
            const places = await Place.placeDb.find({ user: user._id }).lean();                
            return h.view("adminplaces", { places: places, user: user });            
        }
    }, 
    //displays list of POIs with category filter
    placesByCategory: {
        handler: async function (request, h) {
            const categoryId = request.params._id; 
            const category = await Place.categoryDb.find({ _id: categoryId });
            const placesInCategory = await Place.placeDb.find({ category: category[0]._id }).lean();
            return h.view("places", { places: placesInCategory });          
        }
    },
    //shows the page to edit a POI
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
    //shows the page to edit a POI as admin
    adminShowPlace: {
        handler: async function (request, h) {
            const placeId = request.params._id;
            const place = await Place.placeDb.findById(placeId).lean();
            const user = await User.findById(place.user).lean();
            return h.view("admineditplace", { place: place , user: user })
        }
    },  
    //this will edit the POI, every entry for a POI can be changed here. New GPS co-ords with update the weather, hitting update without changing co-ords will update the weather  
    editPlace: {
        handler: async function (request, h) {
            const userid = request.auth.credentials.id;
            const placeId = request.params._id;
            const newData = request.payload;
            const place = await Place.placeDb.findById(placeId);
            const imageId = await ImageStore.getImageId(place.image);
            place.name = newData.name;
            place.description = newData.description;
            const categoryInput = newData.category;
            if(categoryInput != "None"){
            try{
            var category = await Place.categoryDb.find({ name: categoryInput, user: userid });
            }
            catch(err)
            { console.log(err)
            }
            place.category = category[0]._id;
            }
            if(categoryInput == "None"){
                place.category = null;
            }
            place.lat = newData.latitude;
            place.long = newData.longitude;
            if(newData.latitude && newData.longitude){
                weatherReport = await Weather.getWeather(newData.latitude,newData.longitude);
                place.temp = weatherReport.temp;
                place.feelsLike = weatherReport.feelsLike;
                place.clouds = weatherReport.clouds;
                place.windSpeed = weatherReport.windSpeed;
                place.humidity = weatherReport.humidity;
            }
            const imageFile = request.payload.imagefile;
            if (Object.keys(imageFile).length > 0) {
                if(place.image != "https://res.cloudinary.com/djmtnizt7/image/upload/v1616502936/globe_binoc_jdgn3n.png"){
                    await ImageStore.deleteImage(imageId);
                }
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
    //admin edit POI page, only name description can be edited, and the photo can be deleted
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
    //deletes a POI and deletes the image on the cloudinary app        
    deletePlace: {
        handler: async function (request, h) {
            const placeId = request.params._id;
            const place = await Place.placeDb.findById(placeId);
            const imageId = await ImageStore.getImageId(place.image);
            if(place.image != "https://res.cloudinary.com/djmtnizt7/image/upload/v1616502936/globe_binoc_jdgn3n.png"){
                await ImageStore.deleteImage(imageId);
        }
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
    //admin can delete inappropriate images
    adminDeleteImage: {
        handler: async function (request, h) {
            const placeId = request.params._id;
            const place = await Place.placeDb.findById(placeId);
            const imageId = await ImageStore.getImageId(place.image);
            await ImageStore.deleteImage(imageId);
            place.image = "https://res.cloudinary.com/djmtnizt7/image/upload/v1616502936/globe_binoc_jdgn3n.png"
            await place.save();
            const user = await User.findById(place.user).lean();
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
    },
    deleteCategory: {
        handler: async function (request, h) {
            const categoryId = request.params._id;
            category = await Place.categoryDb.findById(categoryId);
            await category.remove();
            return h.redirect("/category");
        }
    } 
};

module.exports = Places;