const Places = {
    home: {
        handler: function (request, h) {
            return h.view("main", { places: this.places, });
        }
    },
    add: {
        handler: function (request, h) {
            const data = request.payload;
            this.places = data;
            return h.view("main", { places: this.places, });
          }
    },
};

module.exports = Places;