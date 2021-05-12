const Users = require('./app/api/users.js');
const Places = require('./app/api/places.js');

module.exports = [
    { method: 'GET', path: '/api/users', config: Users.find },
    { method: 'GET', path: '/api/users/{id}', config: Users.findOne },
    { method: 'POST', path: '/api/users', config: Users.create },
    { method: 'DELETE', path: '/api/users', config: Users.deleteAll },
    { method: 'DELETE', path: '/api/users/{id}', config: Users.deleteOne },
    { method: 'GET', path: '/api/places', config: Places.find },
    { method: 'GET', path: '/api/places/{id}', config: Places.findOne },
    { method: 'POST', path: '/api/places', config: Places.create },
    { method: 'DELETE', path: '/api/places', config: Places.deleteAll },
    { method: 'DELETE', path: '/api/places/{id}', config: Places.deleteOne }    
];