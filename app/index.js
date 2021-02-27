const Hapi = require('@hapi/hapi');
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");



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
  },
  path: "./app/views"
})


server.bind({
  places: {},
});

  server.route(require("./routes"));

  console.log(`Server started at ${server.info.uri}`);
}

init();

