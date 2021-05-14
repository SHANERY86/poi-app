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
          console.log("deleted");
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