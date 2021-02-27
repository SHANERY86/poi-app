const Places = {
    home: {
        handler: function (request, h) {
            return h.view("main", { places: this.places, });
        }
    },
    add: {
        handler: function (request, h) {
            const data = request.payload;
            this.places.push(data);
            return h.redirect("/");
          }
    },
};

module.exports = Places;