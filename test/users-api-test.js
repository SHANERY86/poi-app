"use strict";

const assert = require("chai").assert;
const POIService = require("./poi-service.js");
const fixtures = require("./fixtures.json");
const _ = require("lodash");

suite("User API tests", function() {
    let users = fixtures.users;
    let newUser = fixtures.newUser;

    const poiService = new POIService(fixtures.appHost);

    suiteSetup(async function () {
        await poiService.deleteAllUsers();
        const returnedUser = await poiService.createUser(newUser);
        const response = await poiService.authenticate(newUser);
      });
    
      suiteTeardown(async function () {
        await poiService.deleteAllUsers();
        poiService.clearAuth();
      }) 
   
   
    test("create a user", async function () {
        const returnedUser = await poiService.createUser(users[0]);
        assert(_.some([returnedUser], users[0]), "returnedUser must be a superset of newUser");
        assert.isDefined(returnedUser._id);
    });

    test("get User", async function () {
        const c1 = await poiService.createUser(users[0]);
        const c2 = await poiService.getUser(c1._id);
        assert.deepEqual(c1,c2);
    });

    test("get invalid user", async function () {
        const returnedUser = await poiService.createUser(newUser);
        const c1 = await poiService.getUser("1234");
        assert.isNull(c1);
        const c2 = await poiService.getUser("012345678901234567890123");
        assert.isNull(c2);
      });

      test("delete a User", async function () {
        const c = await poiService.createUser(users[0]);
        assert(c._id != null);
        await poiService.deleteOneUser(c._id);
       const d = await poiService.getUser(c._id);
        assert(d == null);
      }); 


});