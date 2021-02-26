const Hapi = require('@hapi/hapi');
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const Handlebars = require("handlebars");


async function init (){
const server = Hapi.server({
    port: 3000,
    host: "localhost",
  });

await server.register(Inert);
await server.register(Vision);
await server.start();
server.views({
  engines: {
    hbs: require("handlebars"),
  }
})

  server.route([
    {
      method: 'GET',
      path: '/',
      handler: function (request, h) {
          return h.view("main");
      }
    },
    {
      method: 'POST',
      path: '/add',
      handler: function (request, h) {
        const data = request.payload;
        return h.view("main", { places: data })
      }
    } 
  ]);

  console.log(`Server started at ${server.info.uri}`);
}

init();