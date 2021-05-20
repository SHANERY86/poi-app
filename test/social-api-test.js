"use strict";

const assert = require("chai").assert;
const POIService = require("./poi-service.js");
const fixtures = require("./fixtures.json");
const _ = require("lodash");

suite("Social API tests", function ()  {
    let places = fixtures.places;
    let users = fixtures.users;

    const poiService = new POIService(fixtures.appHost);

    setup(async function () {
        await poiService.deleteAllPlaces();
        await poiService.deleteAllUsers();
        await poiService.deleteAllRatings();
    });

    teardown(async function () {
        await poiService.deleteAllPlaces();
        await poiService.deleteAllUsers();
        await poiService.deleteAllRatings();
    });

    test("Make a rating", async function () {
        const u1 = await poiService.createUser(users[0]);
        const p1 = await poiService.createPlace(u1._id,places[0]);
        const ratingval = 5;
        const rating = {
            user: u1,
            place: p1,
            rating: ratingval
        }
        const r1 = await poiService.setRating(p1._id,rating);
        const ratings = await poiService.getRatings();
        assert.equal(ratings.length, 1);
        assert.equal(ratings[0].rating, r1.rating);
    })

});