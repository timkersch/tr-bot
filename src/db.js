'use strict';

const dynamo = require('dynamodb');
dynamo.AWS.config.update({accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET, region: "us-east-1"});

const Log = require('./dbModel').Log;

function isActive(user, today, cb) {
    Log
        .query(user)
        .usingIndex('userIndex')
        .where('date_ticket').beginsWith(today)
        .filter('active').equals(true)
        .exec((err, post)  => {
            if (post && post.Count > 0) {
                cb(true);
            } else {
                cb(false);
            }
        });
}

function setStart(user, today, ticket, successCallback) {
    const date_ticket = today.concat('_').concat(ticket);
    const id = user.concat('_').concat(date_ticket);
    
    // See if this ID already exists
    Log.get(id, (err, post) => {
        // If it does not exist
        if (err !== null || post === null || post.get('active')) {
            isActive(user, today, (active) => {
                if (!active) {            
                    Log.create({
                        id: id,
                        user: user,
                        date: today,
                        date_ticket: date_ticket,
                        ticket: ticket,
                        active: true,
                        counter: 0,
                    }, (err, post) => {
                        successCallback(true);
                    });
                } else {
                    successCallback(false)
                }
            });
        // If active
        } else if(post !== null && post.get('active')) {
            successCallback(false);
        // If it exists but is not active - activate again
        } else {
            isActive(user, today, (active) => {
                if (!active) {
                    Log.update({
                        id: id,
                        active: true
                    }, (err, post) => {
                        successCallback(true);
                    });
                } else {
                    successCallback(false);
                }
            });
        }
    });
}

function setStop(user, today, cb) {
    Log
        .query(user)
        .usingIndex('userIndex')
        .where('date_ticket').beginsWith(today)
        .filter('active').equals(true)
        .exec((err, post) => {
            if (!err && post && post.Count > 0) {
                const attrs = post.Items[0].attrs;
                const id = attrs['id'];
                const ticket = attrs['ticket']
                const counter = attrs['counter'];
                
                // Latest time modified is either when it was created or updated
                const latestModified = new Date(attrs['updatedAt'] ? attrs['updatedAt'] : attrs['createdAt']);
                const timeDiff = Date.now() - latestModified.getTime();
                const newCounter = counter + timeDiff;
                Log.update({
                    id: id,
                    counter: newCounter,
                    active: false
                }, (err, post) => {
                    cb(ticket, timeDiff);
                });
            } else {
                cb(null, null);
            }
        });
}

module.exports = {
    setStart: setStart,
    setStop: setStop,
};