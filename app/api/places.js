'use strict';

const Boom  = require('@hapi/boom');
const Place = require('../models/place');

const Places = {
    find: {
        auth: false,
        handler: async function (request, h) {
            const places = await Place.placeDb.findAll();
            return places;
        }
    },
    findOne: {
        auth: false,
        handler: async function (request, h) {
        try {
            const place = await Place.placeDb.findOne({ _id: request.params.id } );
            if (!place){
                return Boom.notFound("No User with this id");
            }
            return place;
        }
            catch (err) {
                return Boom.notFound("No User with this id");
            }            
        }
    }
};

module.exports = Places;