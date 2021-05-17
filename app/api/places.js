'use strict';

const Boom  = require('@hapi/boom');
const Place = require('../models/place');
const User = require('../models/user');

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
    findByUser: {
      auth: false,
      handler: async function (request, h) {
        try {
          const places = await Place.placeDb.find( { user: request.params.id });
          if (!places){
            return Boom.notFound("No places with this user ID");
          }
          return places;
        }
        catch (err) {
          return Boom.notFound("No places with this User ID");
        }
      }
    },
    create: {
        auth: false,
        handler: async function (request, h) {
          const data = request.payload;
          const user = await User.findOne({ _id: request.params.id });
          if (!user) {
            return Boom.notFound("No User with this id");
          }
          let newPlace = new Place.placeDb({
            name: data.name,
            description: data.description,
            user: user._id
           });
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
      },
      deleteByUser: {
        auth: false,
        handler: async function(request, h) {
          const response = await Place.placeDb.deleteMany( { user: request.params.id } )
          if (response.deletedCount >= 1) {
            return { success: true };
          }
          return Boom.notFound('This user has no places, or does not exist');
        }
      }
};

module.exports = Places;