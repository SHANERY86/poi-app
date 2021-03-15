const Hapi = require('@hapi/hapi');
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const Cookie = require("@hapi/cookie");
const env = require('dotenv');

env.config();

async function init (){
const server = Hapi.server({
    port: 3000,
    host: "localhost",
  });

await server.register(Inert);
await server.register(Vision);
await server.register(Cookie);
await server.start();

server.views({
  engines: {
    hbs: require("handlebars"),
  },
  path: "./app/views",
  partialsPath: "./app/views/partials",
  layout: true
});

server.auth.strategy('session', 'cookie', {
  cookie: {
    name: process.env.cookie_name,
    password: process.env.cookie_password,
    isSecure: false,
  },
  redirectTo: '/',
});

server.auth.default('session');

  server.route(require("./routes"));

  console.log(`Server started at ${server.info.uri}`);
}

init();

