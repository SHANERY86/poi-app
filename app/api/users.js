'use strict';

const User = require('../models/user.js');
const Boom = require('@hapi/boom');

const Users = {
    find: {
        auth: false,
        handler: async function (request, h) {
            const users = await User.find();
            return users;
        }
    },
    findOne: {
        auth: false,
        handler: async function (request, h) {
        try {
            const user = await User.findOne( { _id: request.params.id } );
            if (!user) {
                return Boom.notFound("No User with this id");
            }
            return user;
        } catch (err) {
            return Boom.notFound("No User with this id");
        }
        }
    }
};

module.exports = Users;

