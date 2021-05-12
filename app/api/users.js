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
    }
};

module.exports = Users;

