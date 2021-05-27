const Place = require("../models/place");
const User = require("../models/user");
const ImageStore = require("../utils/image-store");
const Weather = require("../utils/weather");
const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');
const Social = require("./social");
const sanitizeHtml = require('sanitize-html');


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
            return h.view("addplaces");
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
            const sanitisedName = sanitizeHtml(data.name);
            const sanitisedDescription = sanitizeHtml(data.description);
            if (sanitisedName == "" || sanitisedDescription == ""){
                const message = "User Input blocked for security reasons"
                throw Boom.badData(message);
              }
              let sanitisedDescriptionShort = "";                                           //this will shorten the input for displaying in a neat way on a 'place card'
              if(sanitisedDescription.length > 300){
                  sanitisedDescriptionShort = sanitisedDescription.substring(0,300) + "...";
              }
              if(sanitisedDescription.length <= 300){
                  sanitisedDescriptionShort = sanitisedDescription;
              }
            const newPlace = new Place.placeDb({
                name: sanitisedName,
                description: sanitisedDescription,
                descriptionShort: sanitisedDescriptionShort,
                user: user._id,
                image: imageUrl,
                category: data.category,
                social: false
            });
            if(data.latitude && data.longitude){                                            //if the user has entered GPS coordinates when adding a place
                weatherReport = await Weather.getWeather(data.latitude,data.longitude);
                newPlace.lat = data.latitude;
                newPlace.long = data.longitude;
                newPlace.temp = weatherReport.temp;
                newPlace.feelsLike = weatherReport.feelsLike;
                newPlace.clouds = weatherReport.clouds;
                newPlace.windSpeed = weatherReport.windSpeed;
                newPlace.humidity = weatherReport.humidity; 
            }
            newPlace.username = user.name;
            newPlace.useremail = user.email;
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
    //displays the private POI list for a user
    places: {
        handler: async function (request, h) {
            try{
            const id = request.auth.credentials.id;
            const user = await User.findById(id);
            const userPlaces = await Place.placeDb.find({ user: user._id }); 
            await Places.updateWeatherInfo(userPlaces);
            const places = await Place.placeDb.find({ user: user._id }).lean();       
            return h.view("places", { places: places }); 
            }
            catch (err) {
                return h.view("errorpage", { errors: [{ message: err.message }] } );
            }          
        }
    },
    //displays the list of POIs that users have shared
    socialPlaces: {
        handler: async function (request, h) {
            let places = await Place.placeDb.find( { social: true } );
            await Places.updateWeatherInfo(places);
            places = await Place.placeDb.find({ social: true }).lean(); 
            return h.view("socialplaces", { places: places, });                       
    }
},
//displays list of POIs that users have shared filtered by selected category
    socialPlacesByCategory: {
        handler: async function (request, h) {
            const category = request.params.cat;
            const places = await Place.placeDb.find({ category: category }).lean();
            return h.view("socialplaces", { places: places });
        }        
    },
    //this presents detailed info about a POI when selected from the private list
    onePlace: {
        handler: async function (request, h) {
            const placeId = request.params.id;
            const place = await Place.placeDb.findById(placeId).lean();
            return h.view("place", { place: place });
        }
    },
        //this presents detailed info about a POI when selected from the social list
    onePlaceSocial: {
        handler: async function (request, h) {
            const placeId = request.params.id;
            const place = await Place.placeDb.findById(placeId).lean();
            const placeReviews = await Place.reviewDb.find({ place: placeId }).lean();
            const user = await User.findById(request.auth.credentials.id).lean();    
            const placeComments = await Place.commentsDb.find( { place: place } ).lean();  
            await Places.loadRatingAvg(placeId);
            return h.view("place", { place: place, reviews: placeReviews, user: user, comments: placeComments, social:true });
        }       
    },
        //this shares a POI from a users private POI list, it will now be visible for all users in the social POI list
        //creates an event that will be visible on the noticeboard to inform other users of the POI being shared
    sharePlace: {
        handler: async function (request, h) {
            const user = await User.findById(request.auth.credentials.id);
            const placeId = request.params.id;
            const place = await Place.placeDb.findById(placeId);
            place.social = true;
            place.save();
            const dateAndTime = Social.getDateAndTime();
            const event = new Place.eventDb({
                type: "shared a Place",
                refid: placeId,
                dateAndTime: dateAndTime.dateAndTime,
                utc: dateAndTime.utc,
                dayAndMonth: dateAndTime.dayAndMonth,
                content: place.description,
                place: {
                    id: place._id,
                    name: place.name,
                    image: place.image,
                },
                username: user.name
            })
            event.save();   
            return h.redirect("/places");
        }
    },
    //this will remove the POI from the social list, meaning it will now only be visible to the user who created it in their private list
    //also deletes the event tied to the share, which means the notification of this POI being shared will no longer show up on the notice board
    makePrivate: {
        handler: async function (request, h) {
            const placeId = request.params.id;
            const place = await Place.placeDb.findById(placeId);
            place.social = false;
            place.save();
            const shareEvent = await Place.eventDb.find( { type:"shared a Place", "place.id": placeId } );
            if(shareEvent[0]){
            shareEvent[0].remove();
            }
            return h.redirect("/places");
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
    //displays list of private POIs with category filter
    placesByCategory: {
        handler: async function (request, h) {
            const category = request.params.cat; 
            const userid = request.auth.credentials.id;
            const placesInCategory = await Place.placeDb.find( { category: category, user:userid } ).lean();
            return h.view("places", { places: placesInCategory });          
        }
    },
    //shows the page to edit a POI
    showPlace: {
        handler: async function (request, h) {
            const userid = request.auth.credentials.id;
            const user = await User.findById(userid);
            const placeId = request.params._id;
            const place = await Place.placeDb.findById(placeId).lean();
            return h.view("editplace", { place: place })
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
            failAction: async function (request, h, error) {
                const placeId = request.params._id;
                const place = await Place.placeDb.findById(placeId);
                const userid = request.auth.credentials.id;
                const user = await User.findById(userid);
                const userCategories = await Place.categoryDb.find({ user: user._id }).lean();
              return h
                .view("editplace", { place: place, categories: userCategories,
                  errors: error.details
                })
                .takeover()
                .code(400);
            },
          }, 
        handler: async function (request, h) {
            try {
            const userid = request.auth.credentials.id;
            const placeId = request.params._id;
            const newData = request.payload;
            const place = await Place.placeDb.findById(placeId);
            const imageId = await ImageStore.getImageId(place.image);

            const sanitisedName = sanitizeHtml(newData.name);
            const sanitisedDescription = sanitizeHtml(newData.description);
            if (sanitisedName == "" || sanitisedDescription == ""){
                const message = "User Input blocked for security reasons"
                throw Boom.badData(message);
              }
            place.name = sanitisedName;
            place.description = sanitisedDescription;
            place.category = newData.category;
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
                const imageUrls = Places.loadSeedImages();
                let deleteImage = true;
                for(let i = 0; i < imageUrls.length; i++){
                if(place.image == imageUrls[i]){
                    deleteImage = false;
                }       
                if(deleteImage){
                    await ImageStore.deleteImage(imageId);
                }
                }
            newImageUrl = await ImageStore.uploadImage(imageFile);
            place.image = newImageUrl;
            }
            await place.save();
            return h.redirect("/places");
        }
        catch (err) {
            const placeId = request.params._id;
            const place = await Place.placeDb.findById(placeId).lean();
            const userid = request.auth.credentials.id;
            const user = await User.findById(userid);
            const userCategories = await Place.categoryDb.find({ user: user._id }).lean();
            return h.view("editplace", { place: place, categories: userCategories, errors: [ { message: err.message } ] });
        } 
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
    //deletes a POI and if the image isnt one of the few images related to the POIs associated with seed data, deletes the image      
    deletePlace: {
        handler: async function (request, h) {
            const placeId = request.params._id;
            const place = await Place.placeDb.findById(placeId);
            const imageId = await ImageStore.getImageId(place.image);
            const imageUrls = Places.loadSeedImages();
            let deleteImage = true;
            for(let i = 0; i < imageUrls.length; i++){
            if(place.image == imageUrls[i]){
                deleteImage = false;
            }       
            if(deleteImage){
                await ImageStore.deleteImage(imageId);
            }
            }
            await place.remove();
            return h.redirect("/places");
        }
    },
    adminDeletePlace: {
        handler: async function (request, h) {
            const placeId = request.params._id;
            const place = await Place.placeDb.findById(placeId);
 //           const imageId = await ImageStore.getImageId(place.url);
//            await ImageStore.deleteImage(imageId);
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
    //displays list of category links, for list filtering by category type, clicking on a category on this page returns a private POI list filtered by that category
    category: {
        handler: async function (request, h) {
            const categories = Places.loadCategories();
            return h.view("category", { categories: categories , personal: true});
        }
    },
    //displays list of category links for the social side of the site
    socialCategory: {
        handler: async function (request, h) {
            const categories = Places.loadCategories();
            return h.view("category", { categories: categories});
        }
    },
    //this is where the route for the iframe points to in the place.hbs file for displaying the map in a POI page
    placeMap: {
        handler: async function (request, h) {
            const place = await Place.placeDb.findById(request.params.id).lean();
        return h.view("placemap", { place: place } );
        }
    },
    //this is the route for the iframe to display the big map on the page after you log in
    map: {
        handler: async function (request, h) {
            let places = await Place.placeDb.findAll();
            for(const place of places){
                await Places.loadRatingAvg(place._id); 
            }
            await Places.updateWeatherInfo(places);
            places = await Place.placeDb.find({ social: true }).lean(); 
            return h.view("allmap", { places: places }); 
        }
    },
    //this will display the page with the big map
    mapView: {
        handler: async function (request, h) {
            return h.view("placesmap");        
        }
    },
    //this is the route for the iframe for the map that assists a user in picking GPS co-ordinates when adding a POI
    addGPSView: {
        handler: async function (request, h) {
            return h.view("addgpsmap");        
        }        
    },
    //this function will update the weather for a list of places
    async updateWeatherInfo(places){
        for (const place of places){
            if(place.lat && place.long){
                let placeId = place._id;
                let placeData = await Place.placeDb.findById(placeId);
                let weatherReport = await Weather.getWeather(place.lat,place.long);
                placeData.temp = weatherReport.temp;
                placeData.feelsLike = weatherReport.feelsLike;
                placeData.clouds = weatherReport.clouds;
                placeData.windSpeed = weatherReport.windSpeed;
                placeData.humidity = weatherReport.humidity; 
                await placeData.save();
        }
    }
},
//this loads the categories
    loadCategories() {
        categories = [ 
            "None", 
            "City", 
            "Town", 
            "Landmark - Man Made",
            "Landmark - Natural",
            "Mountain",
            "Hill",
            "Beach",
            "Lake",
            "River",
            "Island" ]
            return categories;
    },
    loadSeedImages() {
        imageUrls = [
            "https://res.cloudinary.com/djmtnizt7/image/upload/v1618947790/xy0x6r5px25yi471hh01.jpg",
            "https://res.cloudinary.com/djmtnizt7/image/upload/v1619883447/lmnlfck10ekoicqffdml.jpg",
            "https://res.cloudinary.com/djmtnizt7/image/upload/v1619883691/x0r0ut8vqbuntwn7szqr.jpg",
            "https://res.cloudinary.com/djmtnizt7/image/upload/v1622027863/kt9u8u8slxr7qwfis37r.jpg",
            "https://res.cloudinary.com/djmtnizt7/image/upload/v1622029501/Melbourne2_j3cvkf.jpg",
            "https://res.cloudinary.com/djmtnizt7/image/upload/v1622029684/grandcanyon_hdwaac.jpg",
            "https://res.cloudinary.com/djmtnizt7/image/upload/v1616502936/globe_binoc_jdgn3n.png"
        ]
        return imageUrls;
    },
    //this function will calculate the average rating for a POI, given a place ID it will find a list of its submitted ratings and average them. 
    async loadRatingAvg(placeId){
        const placeRatings = await Place.ratingDb.find( { place: placeId } );
        let ratingstotal = 0;
        let ratingsAvg = 0;
        let index = 0;
        placeRatings.forEach(function(placeRating) {
            ratingstotal += placeRating.rating;
            index++;
        })
        if(index > 0){
        ratingsAvg = ratingstotal / index;
        const placeObj = await Place.placeDb.findById(placeId);
        placeObj.numberOfRatings = index;
        placeObj.rating = Math.round(ratingsAvg * 10)/10;
        await placeObj.save();
        }
    }
};


module.exports = Places 