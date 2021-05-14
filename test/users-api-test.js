"use strict";

const assert = require("chai").assert;
const POIService = require("./poi-service.js");
const fixtures = require("./fixtures.json");
const _ = require("lodash");

suite("User API tests", function() {
    let users = fixtures.users;
    let newUser = fixtures.newUser;

    const poiService = new POIService(fixtures.appHost);

    setup(async function () {
        await poiService.deleteAllUsers();
    });

    teardown(async function () {
        await poiService.deleteAllUsers();
    });

    test("create a user", async function () {
        const returnedUser = await poiService.createUser(newUser);
        assert(_.some([returnedUser], newUser), "returnedUser must be a superset of newUser");
        assert.isDefined(returnedUser._id);
    });

    test("get User", async function () {
        const c1 = await poiService.createUser(newUser);
        const c2 = await poiService.getUser(c1._id);
        assert.deepEqual(c1,c2);
    });

    test("get invalid user", async function () {
        const c1 = await poiService.getUser("1234");
        assert.isNull(c1);
        const c2 = await poiService.getUser("012345678901234567890123");
        assert.isNull(c2);
      });

      test("delete a User", async function () {
        let c = await poiService.createUser(newUser);
        assert(c._id != null);
        await poiService.deleteOneUser(c._id);
        c = await poiService.getUser(c._id);
        assert(c == null);
      }); 


});