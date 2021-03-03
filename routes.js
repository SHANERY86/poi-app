"use strict";

const Places = require("./app/controllers/places");
const Accounts = require("./app/controllers/accounts");

module.exports = [
    { method: 'GET', path: '/', config: Places.home },
    { method: 'POST', path: '/add', config: Places.add },
    { method: 'GET', path: '/signup', config: Accounts.signup},
    { method: 'GET', path: '/login', config: Accounts.login},
    {
        method: "GET",
        path: "/{param*}",
        handler: {
          directory: {
            path: "./app/public",
          },
        },
      },
];