"use strict";

const Places = require("./app/controllers/places");
const Accounts = require("./app/controllers/accounts");

module.exports = [
    { method: 'GET', path: '/', config: Places.home },
    { method: 'GET', path: '/addview', config: Places.addView },
    { method: 'GET', path: '/places', config: Places.places },
    { method: 'GET', path: '/category', config: Places.category },
    { method: 'POST', path: '/createcat', config: Places.addCategory },        
    { method: 'GET', path: '/places/{_id}', config: Places.places },
    { method: 'GET', path: '/placesbycat/{_id}', config: Places.placesByCategory },          
    { method: 'POST', path: '/addplace', config: Places.add },
    { method: 'GET', path: '/signup', config: Accounts.signup },
    { method: 'GET', path: '/loginView', config: Accounts.loginView },
    { method: 'POST', path: '/login', config: Accounts.login },
    { method: 'GET', path: '/logout', config: Accounts.logout },    
    { method: 'POST', path: '/adduser', config: Accounts.adduser },
    { method: 'GET', path: '/showplace/{_id}', config: Places.showPlace },
    { method: 'POST', path: '/editplace/{_id}', config: Places.editPlace },
    { method: 'GET', path: '/deleteplace/{_id}', config: Places.deletePlace },
    { method: 'GET', path: '/settings/{_id}', config: Accounts.settings },   
    { method: 'POST', path: '/edituser/{_id}', config: Accounts.editUser },
    { method: 'GET', path: '/deleteacc/{_id}', config: Accounts.deleteUser },    
    { method: 'GET', path: '/adminlogin', config: Accounts.adminLogin },
    { method: 'POST', path: '/admin', config: Accounts.admin },         
    {
        method: "GET",
        path: "/{param*}",
        handler: {
          directory: {
            path: "./app/public",
          },
        },
        options: { auth: false }
      }
];