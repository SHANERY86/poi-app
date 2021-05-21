const Users = require('./app/api/users.js');
const Places = require('./app/api/places.js');
const SocialApi = require('./app/api/social-api');

module.exports = [
    { method: 'GET', path: '/api/users', config: Users.find },
    { method: 'GET', path: '/api/users/{id}', config: Users.findOne },
    { method: 'POST', path: '/api/users', config: Users.create },
    { method: 'DELETE', path: '/api/users', config: Users.deleteAll },
    { method: 'DELETE', path: '/api/users/{id}', config: Users.deleteOne },
    { method: 'GET', path: '/api/places', config: Places.find },
    { method: 'GET', path: '/api/places/{id}', config: Places.findOne },
    { method: 'GET', path: '/api/{id}/places', config: Places.findByUser },
    { method: 'POST', path: '/api/{id}/places', config: Places.create },
    { method: 'DELETE', path: '/api/places', config: Places.deleteAll },
    { method: 'DELETE', path: '/api/places/{id}', config: Places.deleteOne },
    { method: 'DELETE', path: '/api/{id}/places', config: Places.deleteByUser},
    { method: 'POST', path: '/api/ratings/{id}', config: SocialApi.setRatingForPlace }, 
    { method: 'GET', path: '/api/ratings', config: SocialApi.getRatings },
    { method: 'DELETE', path: '/api/ratings', config: SocialApi.deleteAllRatings },     
    { method: 'POST', path: '/api/review', config: SocialApi.makeReview },
    { method: 'POST', path: '/api/review/{id}', config: SocialApi.editReview },
    { method: 'DELETE', path: '/api/review/{id}', config: SocialApi.deleteReview },     
    { method: 'DELETE', path: '/api/review', config: SocialApi.deleteAllReviews },
    { method: 'GET', path: '/api/review', config: SocialApi.getReviews },  
    { method: 'GET', path: '/api/review/{id}', config: SocialApi.getReview },
    { method: 'GET', path: '/api/comments', config: SocialApi.getAllComments },
    { method: 'GET', path: '/api/comments/{id}', config: SocialApi.getComment },    
    { method: 'POST', path: '/api/comments', config: SocialApi.makeComment },    
    { method: 'POST', path: '/api/comments/{id}', config: SocialApi.editComment },  
    { method: 'DELETE', path: '/api/comments', config: SocialApi.deleteAllComments },    
    { method: 'DELETE', path: '/api/comments/{id}', config: SocialApi.deleteComment },
    { method: 'POST', path: '/api/commentreply/{id}', config: SocialApi.makeReply },
    { method: 'POST', path: '/api/commentreplyedit/{id}', config: SocialApi.editReply },
    { method: 'DELETE', path: '/api/commentreplydelete/{id}', config: SocialApi.deleteReply }, 

];