places = [];

const Places = {
    home: {
        auth: false,
        handler: function (request, h) {
            return h.view("start");
        }
    },
    addView: {
        handler: function (request, h) {
            return h.view("addplaces");
        }
    },
    add: {
        handler: function (request, h) {
            const data = request.payload;
            data.user = request.auth.credentials.id;
            places.push(data);
            return h.redirect("/places");
          }
    },
    places: {
        handler: function (request, h) {
            userPlaces = [];
            const userEmail = request.auth.credentials.id;
            places.forEach(function(place) {
            if (userEmail == place.user) {
                userPlaces.push(place);
            }
            });
            return h.view("places", { places: userPlaces, });           
        }
    }
};

module.exports = Places;