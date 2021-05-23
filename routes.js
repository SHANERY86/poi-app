"use strict";

const Places = require("./app/controllers/places");
const Accounts = require("./app/controllers/accounts");
const Social = require("./app/controllers/social")
const NoticeBoard = require("./app/controllers/noticeboard");

module.exports = [
    { method: 'GET', path: '/', config: Places.home },
    { method: 'GET', path: '/addview', config: Places.addView },
    { method: 'GET', path: '/places', config: Places.places },
    { method: 'GET', path: '/socialplaces', config: Places.socialPlaces },
    { method: 'GET', path: '/place/{id}', config: Places.onePlace },  
    { method: 'POST', path: '/rating/{id}', config: Social.rating },  
    { method: 'GET', path: '/writereview/{id}', config: Social.writeReview },  
    { method: 'GET', path: '/showreview/{id}', config: Social.editReviewDisplay },          
    { method: 'POST', path: '/review/{id}', config: Social.review },    
    { method: 'POST', path: '/editreview/{id}', config: Social.editReview },  
    { method: 'GET', path: '/deletereview/{id}', config: Social.deleteReview },  
    { method: 'POST', path: '/comment/{id}', config: Social.addComment },   
    { method: 'GET', path: '/showcomment/{id}', config: Social.editCommentDisplay },
    { method: 'POST', path: '/editcomment/{id}', config: Social.editComment },   
    { method: 'GET', path: '/deletecomment/{id}', config: Social.deleteComment },
    { method: 'GET', path: '/reply/{id}', config: Social.replyView },   
    { method: 'GET', path: '/reply2reply/{id}', config: Social.replyToReplyView },       
    { method: 'POST', path: '/addreply/{id}', config: Social.addReply }, 
    { method: 'GET', path: '/deletereply/{id}', config: Social.deleteReply },   
    { method: 'GET', path: '/showreply/{id}', config: Social.editReplyView },                                  
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
    { method: 'GET', path: '/noticeboard', config: NoticeBoard.viewNoticeBoard }, 
    { method: 'GET', path: '/map/{id}', config: Places.map },       
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