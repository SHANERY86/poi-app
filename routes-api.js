const Users = require('./app/api/users.js');
const Places = require('./app/api/places.js');

module.exports = [
    { method: 'GET', path: '/api/users', config: Users.find },
    { method: 'GET', path: '/api/users/{id}', config: Users.findOne },
    { method: 'GET', path: '/api/places', config: Places.find },
    { method: 'GET', path: '/api/places/{id}', config: Places.findOne },    
];