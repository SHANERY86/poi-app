"use strict";

const Place = require("../models/place");
const Social = require("../controllers/social");
const User = require("../models/user");


const NoticeBoard = {
    viewNoticeBoard: {
        handler: async function(request, h) {
            try{
            const userid = request.auth.credentials.id;
            const user = await User.findById(userid);
            const loggedInUsername = user.name;
            const socialPlaces = await Place.placeDb.find({ social : true });
            const socialPlaceIds = [];
            for (const place of socialPlaces){
                socialPlaceIds.push(place._id)
            } 
            const events = await Place.eventDb.find({ 
                "place.id": { $in: socialPlaceIds }, 
                type: { $nin: "replied" }, 
                username: { $nin: loggedInUsername } 
            }).lean();
            const replyEvents = await Place.eventDb.find( { type: "replied" } );
            const replyEventsForYou_ids = [];
            for (const replyEvent of replyEvents){
                const replyId = replyEvent.refid.toString();
                const replyInfo = await Social.getCommentAndReplyIndex(replyId);
                const comment = replyInfo.comment;
                const replyIndex = replyInfo.replyIndex;
                if(comment.replies[replyIndex].userId != userid && comment.userId == userid){
                    replyEventsForYou_ids.push(replyId);
            }
            }
            const replyEventsForYou = await Place.eventDb.find({ refid: { $in: replyEventsForYou_ids } } ).lean();
            for (const replyEvent of replyEventsForYou){
                events.push(replyEvent);
            }
            const currentDateAndTime = Social.getDateAndTime();
            const currentDate = currentDateAndTime.dateAndTime.substr(0,2);
            const today = new Date()
            var yesterdayDate = new Date()
            yesterdayDate.setDate(today.getDate() - 1)
            const yday = yesterdayDate.toDateString();
            const yesterday = yday.substr(8,2);
            const justNowEvents = [];
            const todaysEvents = [];
            const yesterdaysEvents = [];
            let laterEvents = [];
            let dateEntriesLeft = [];
            const utc = new Date();
            const utcsecsnow = utc/1000;
            events.forEach(function(event) {
                const eventdateAndTime = event.dateAndTime;
                const eventDate = eventdateAndTime.substr(0,2);
                const utcsecsdiff = (utcsecsnow - event.utc);
                if(utcsecsdiff < 300){
                    justNowEvents.push(event);
                }
                if(utcsecsdiff >= 300 && eventDate == currentDate){
                    todaysEvents.push(event);
                } 
                if(eventDate == yesterday){
                    yesterdaysEvents.push(event);
                } 
                if(eventDate != currentDate && eventDate != yesterday)
                    dateEntriesLeft.push(event.dayAndMonth);
            }) 
            let uniqueDateEntriesLeft = new Set();
            for (let a = 0; a < dateEntriesLeft.length; a++){
                uniqueDateEntriesLeft.add(dateEntriesLeft[a]);
            }

            for( const dateEntry of uniqueDateEntriesLeft){
                var entry = {};
                entry.date = dateEntry;
                entry.events = [];
                const result = await Place.eventDb.find( { dayAndMonth: dateEntry } ).lean();
                for(let i = 0; i < result.length; i++){   
                    entry.events.push(result[i]);             
            }
            laterEvents.push(entry);
            }
            if(justNowEvents.length == 0 && todaysEvents.length == 0 && yesterdaysEvents == 0 && laterEvents == 0){
                return h.view("noticeboard", { empty: true } );
            }
            return(h.view("noticeboard", { 
                justnow: justNowEvents, 
                today: todaysEvents, 
                yesterday: yesterdaysEvents, 
                later: laterEvents
                }));
            }
            catch(err) {
                return h.view("errorpage", {
                    errors: [{ message: err.message }] });          
            }
                
        }
    }
}

module.exports = NoticeBoard;