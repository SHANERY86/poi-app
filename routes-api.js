const Users = require('./app/api/users.js');

module.exports = [
    { method: 'GET', path: '/api/users', config: Users.find }
];