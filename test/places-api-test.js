"use strict";

const assert = require("chai").assert;
const POIService = require("./poi-service.js");
const fixtures = require("./fixtures.json");
const _ = require("lodash");

suite("Places API tests", function ()  {
    let places = fixtures.places;
    let users = fixtures.users;
    let categories = fixtures.categories;

    const poiService = new POIService(fixtures.appHost);

    setup(async function () {
        await poiService.deleteAllPlaces();
        await poiService.deleteAllUsers();
    })

    teardown(async function () {
        await poiService.deleteAllPlaces();
        await poiService.deleteAllUsers();
    });

    test("create a place", async function () {
        const user = await poiService.createUser(users[0]);
        await poiService.createPlace(user._id, places[0]);
        const returnedPlaces = await poiService.getPlaces();
        assert.equal(returnedPlaces.length, 1);
        assert(_.some([returnedPlaces[0]], places[0]), "returned places must be superset of place");
    });

    test("create multiple places", async function () {
        const user = await poiService.createUser(users[0]);
        for (var i = 0; i < places.length; i++) {
            await poiService.createPlace(user._id, places[i]);
        }

        const returnedPlaces = await poiService.getPlaces();
        assert.equal(returnedPlaces.length, places.length);
        for (var i = 0; i < places.length; i++) {
            assert(_.some([returnedPlaces[i]], places[i]), "returned place must be a superset of place");
        }
    });

    test("delete all places", async function () {
        const user = await poiService.createUser(users[0]);
        for (var i = 0; i < places.length; i++) {
            await poiService.createPlace(user._id, places[i]);
        }

        const p1 = await poiService.getPlaces();
        assert.equal(p1.length, places.length);
        await poiService.deleteAllPlaces();
        const p2 = await poiService.getPlaces();
        assert.equal(p2.length, 0);
    });

});