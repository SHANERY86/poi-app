"use strict";

const Place = require("../models/place");
const Social = require("../controllers/social");

const NoticeBoard = {
    viewNoticeBoard: {
        auth: false,
        handler: async function(request, h) {
            const events = await Place.eventDb.find({}).lean();
            const currentDateAndTime = Social.getDateAndTime();
            const currentDate = currentDateAndTime.dateAndTime.substr(0,2);
//            console.log("current date:" + currentDate);
            const today = new Date()
            var yesterdayDate = new Date(today)
            yesterdayDate.setDate(yesterdayDate.getDate() - 1)
            const yday = yesterdayDate.toDateString();
            const yesterday = yday.substr(8,2);
            const justNowEvents = [];
            const todaysEvents = [];
            const yesterdaysEvents = [];
            const laterEventDates = [];
            let laterEvents = [];
            let dateEntriesLeft = [];
            const utc = new Date();
            const utcsecsnow = utc/1000;
            events.forEach(function(event) {
                const eventdateAndTime = event.dateAndTime;
                const eventDate = eventdateAndTime.substr(0,2);
//                console.log(eventDate);
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
//                    console.log(event.dayAndMonth);
                    dateEntriesLeft.push(event.dayAndMonth);
            }) 
 //           console.log(dateEntriesLeft);
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
            console.log(laterEvents);
 //           console.log(uniqueDateEntriesLeft);
/*            uniqueDateEntriesLeft.forEach(async function(dateEntry){
                var entry = {};
                entry.date = dateEntry;
                entry.events = [];
                const result = await Place.eventDb.find( { dayAndMonth: dateEntry } );
 //               console.log(result);
                for(let i = 0; i < result.length; i++){
//                    laterEvents.date = dateEntry;
//                    laterEvents.event = result[i]
//                    var entry = {};
                    entry.events.push(result[i]);
 //                   console.log(entry);
/*                    const entry = {
                        date: dateEntry,
                        event: [result[i]]
                    }  
                }

                 laterEvents.push(entry);
                console.log(laterEvents);
            }) */

            return(h.view("noticeboard", { 
                justnow: justNowEvents, 
                today: todaysEvents, 
                yesterday: yesterdaysEvents, 
                later: laterEvents
                }));
        }
    }
}

module.exports = NoticeBoard;