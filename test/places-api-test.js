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

    test("delete all places for user", async function () {
        const u1 = await poiService.createUser(users[0]);
        const u2 = await poiService.createUser(users[1]);
        for (var i = 0; i < 2; i++) {
            await poiService.createPlace(u1._id, places[i]);
        }
        await poiService.createPlace(u2._id, places[2]);
        
        let returnedPlaces = await poiService.getPlaces();
        let u1Places = await poiService.getPlacesByUser(u1._id);
        let u2Places = await poiService.getPlacesByUser(u2._id);

        assert.equal(returnedPlaces.length, 3);
        assert.equal(u1Places.length, 2);
        assert.equal(u2Places.length, 1);

        await poiService.deletePlacesByUser(u1._id);

        returnedPlaces = await poiService.getPlaces();
        u1Places = await poiService.getPlacesByUser(u1._id);
        u2Places = await poiService.getPlacesByUser(u2._id);
        
        assert.equal(u1Places.length, 0);
        assert.equal(u2Places.length, 1);
        assert.equal(returnedPlaces.length, 1);
    });

});