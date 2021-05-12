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
    },
    create: {
        auth: false,
        handler: async function (request, h) {
          const newPlace = new Place(request.payload);
          const place = await newPlace.save();
          if (place) {
            return h.response(place).code(201);
          }
          return Boom.badImplementation("error creating place");
        }
      },
      deleteAll: {
        auth: false,
        handler: async function (request, h) {
          await Place.placeDb.remove({});
          return { success: true };
        }
      },
      deleteOne: {
        auth: false,
        handler: async function(request, h) {
          const response = await Place.placeDb.deleteOne({ _id: request.params.id });
          if (response.deletedCount == 1) {
            return { success: true };
          }
          return Boom.notFound('id not found');
        }
      }
};

module.exports = Places;