"use strict";

const Places = require("./app/controllers/places");
const Accounts = require("./app/controllers/accounts");

module.exports = [
    { method: 'GET', path: '/', config: Places.home },
    { method: 'GET', path: '/addview', config: Places.addView },
    { method: 'GET', path: '/places', config: Places.places },       
    { method: 'POST', path: '/addplace', config: Places.add },
    { method: 'GET', path: '/signup', config: Accounts.signup },
    { method: 'GET', path: '/loginView', config: Accounts.loginView },
    { method: 'POST', path: '/login', config: Accounts.login },
    { method: 'GET', path: '/logout', config: Accounts.logout },    
    { method: 'POST', path: '/adduser', config: Accounts.adduser },
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