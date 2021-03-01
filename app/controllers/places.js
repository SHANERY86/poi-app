var places = [];

const Places = {
    home: {
        handler: function (request, h) {
            return h.view("main", { places: places, });
        }
    },
    add: {
        handler: function (request, h) {
            const data = request.payload;
            places.push(data);
            return h.redirect("/");
          }
    },
};

module.exports = Places;