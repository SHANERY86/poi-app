const Hapi = require('@hapi/hapi');
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const Cookie = require("@hapi/cookie");
const ImageStore = require('./app/utils/image-store');
const User = require('./app/models/user');
//const dotenv = require('dotenv');
const handlebars = require('handlebars');

/*
const result = dotenv.config();
if (result.error) {
  console.log(result.error.message);
  process.exit(1);
} 
*/
async function init (){

  const server = Hapi.server({
    port: process.env.PORT || 3000,
  });

  const credentials = {
    cloud_name: process.env.name,
    api_key: process.env.key,
    api_secret: process.env.secret
  };



await server.register(Inert);
await server.register(Vision);
await server.register(Cookie);
server.validator(require("@hapi/joi"));
await server.start();
require('./app/models/db')

ImageStore.configure(credentials);

server.views({
  engines: {
    hbs: require("handlebars"),
  },
  relativeTo: __dirname,
  path: "./app/views",
  partialsPath: "./app/views/partials",
  layout: true
});

handlebars.registerHelper("ifMadeByYou", function(reviewUser,loggedInuser,options) {
/*  console.log(reviewUser);
  console.log(loggedInuser); */
  if (reviewUser != undefined && loggedInuser != undefined) {
  let a = reviewUser;
  let b = loggedInuser;
  if (a.toString() == b.toString()){ 
  return options.fn(this); } 
  return options.inverse(this);
  }
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
server.route(require("./routes-api.js"));

console.log(`Server started at ${server.info.uri}`);
}

init();

