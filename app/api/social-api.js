'use strict';

const Place = require('../models/place');

const SocialApi = {
    deleteAllRatings: {
        auth: false,
        handler: async function (request, h) { 
        await Place.ratingDb.remove({});
        return { success: true };
    }
},
    setRatingForPlace: {
        auth: false,
        handler: async function (request, h) { 
        const place = await Place.placeDb.findById(request.params.id);
        const ratingInput = request.payload.rating; 
        const user = request.payload.user;
        const newRating = new Place.ratingDb({
            user: user,
            place: place,
            rating: ratingInput
        })
        newRating.save();
        return newRating;
    }
},
    getRatings: {
        auth: false,
        handler: async function (request, h) { 
            const ratings = await Place.ratingDb.findAll();
            return ratings;       
    }
}
}

module.exports = SocialApi;