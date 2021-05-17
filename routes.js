"use strict";

const Places = require("./app/controllers/places");
const Accounts = require("./app/controllers/accounts");

module.exports = [
    { method: 'GET', path: '/', config: Places.home },
    { method: 'GET', path: '/addview', config: Places.addView },
    { method: 'GET', path: '/places', config: Places.places },
    { method: 'GET', path: '/socialplaces', config: Places.socialPlaces },
    { method: 'GET', path: '/place/{id}', config: Places.onePlace },  
    { method: 'POST', path: '/rating/{id}', config: Places.rating },        
    { method: 'GET', path: '/category', config: Places.category },
    { method: 'POST', path: '/createcat', config: Places.addCategory },  
    { method: 'GET', path: '/deletecat/{_id}', config: Places.deleteCategory },     
    { method: 'GET', path: '/places/{_id}', config: Places.places },
    { method: 'GET', path: '/adminplaces/{_id}', config: Places.adminPlaces },    
    { method: 'GET', path: '/placesbycat/{_id}', config: Places.placesByCategory },          
    { method: 'POST', path: '/addplace', config: Places.add },
    { method: 'GET', path: '/signup', config: Accounts.signup },
    { method: 'GET', path: '/loginView', config: Accounts.loginView },
    { method: 'POST', path: '/login', config: Accounts.login },
    { method: 'GET', path: '/logout', config: Accounts.logout },    
    { method: 'POST', path: '/adduser', config: Accounts.adduser },
    { method: 'GET', path: '/showplace/{_id}', config: Places.showPlace },
    { method: 'GET', path: '/adminshowplace/{_id}', config: Places.adminShowPlace },    
    { method: 'POST', path: '/editplace/{_id}', config: Places.editPlace },
    { method: 'POST', path: '/admineditplace/{_id}', config: Places.adminEditPlace },    
    { method: 'GET', path: '/deleteplace/{_id}', config: Places.deletePlace },
    { method: 'GET', path: '/admindeleteplace/{_id}', config: Places.adminDeletePlace },
    { method: 'GET', path: '/admindeleteimage/{_id}', config: Places.adminDeleteImage },        
    { method: 'GET', path: '/settings/{_id}', config: Accounts.settings },   
    { method: 'POST', path: '/edituser/{_id}', config: Accounts.editUser },
    { method: 'GET', path: '/deleteacc/{_id}', config: Accounts.deleteUser },
    { method: 'GET', path: '/admindeleteacc/{_id}', config: Accounts.adminDeleteUser },        
    { method: 'GET', path: '/admin', config: Accounts.adminLoginView },
    { method: 'POST', path: '/adminlogin', config: Accounts.adminLogin },
    { method: 'GET', path: '/adminview', config: Accounts.adminView },             
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