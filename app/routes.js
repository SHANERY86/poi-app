"use strict";

const Places = require("./controllers/places");

module.exports = [
    { method: 'GET', path: '/', config: Places.home },
    { method: 'POST', path: '/add', config: Places.add },
    {
        method: "GET",
        path: "/{param*}",
        handler: {
          directory: {
            path: "./public",
          },
        },
      },
];