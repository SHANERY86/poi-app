"use strict";

const Place = require("../models/place");
const Social = require("../controllers/social");
const User = require("../models/user");


const NoticeBoard = {
    viewNoticeBoard: {
        handler: async function(request, h) {
            try{
            const userid = request.auth.credentials.id;
            const socialPlaces = await Place.placeDb.find({ social : true });     //this returns a list of places that have been shared by users
            const socialPlaceIds = [];
            for (const place of socialPlaces){
                socialPlaceIds.push(place._id)
            } 
            const events = await Place.eventDb.find({ 
                "place.id": { $in: socialPlaceIds },    //this ensures that events about shared places only appear on the noticeboard, events about places that have been 
                type: { $nin: "replied" },              //made private wont show, also does not return reply events
            }).lean();


            //the code in the block below will push reply events that are associated with comments that the logged in user made, ensuring that the user only
            //receives notifications about replies for their own comments. This will stop the noticeboard becoming cluttered with reply events that have
            //nothing to do with the user if a long string of messages back and forth between two users occurs.

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

            //the code block below is gathering events in blocks of time. The blocks are 'just now','today','yesterday' and 'later'
            //this will organise and display notifications on the notice board in blocks of time that they occurred
            //the 'just now' will check to see if the event occurred in the last 5 minutes
            //the 'today' block will check to see if the event occurred on the current date
            //the 'yesterday' block will check to see if the event occurred on yesterdays date
            //the 'later' block will gather all of the remaining events, and arrange them into objects with the appropriate date
            //this provides a neat and organised time orientated display of notifications

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
                    justNowEvents.unshift(event);
                }
                if(utcsecsdiff >= 300 && eventDate == currentDate){
                    todaysEvents.unshift(event);
                } 
                if(eventDate == yesterday){
                    yesterdaysEvents.unshift(event);
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
                    entry.events.unshift(result[i]);             
            }
            laterEvents.unshift(entry);
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