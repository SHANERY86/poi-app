const Hapi = require('@hapi/hapi');
const Inert = require("@hapi/inert");


async function init (){
const server = Hapi.server({
    port: 3000,
    host: "localhost",
  });

await server.register(Inert);
await server.start();

  server.route({
      method: 'GET',
      path: '/',
      handler: function (request, h) {
          return h.file("./main.html");
      }
  });


  console.log(`Server started at ${server.info.uri}`);
}

init();