'use strict';

const dynamo = require('dynamodb');
dynamo.AWS.config.update({accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET, region: "us-east-1"});

const Log = require('./dbModel').Log;

function isActive(user, today, cb) {
    Log
        .query(user)
        .usingIndex('userIndex')
        .descending()
        .attributes(['active'])
        .limit(1)
        .exec((err, post)  => {
            console.log(err);
            if (!err && post.Items && post.Items.length > 0) {
                cb(post.Items[0].attrs['active']);
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
        console.log(err);
        console.log(post);
        // If it does not exist
        if (err !== null || post === null) {
            console.log('in first if');
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
                        console.log(err);
                        console.log(post);
                        successCallback(true);
                    });
                } else {
                    successCallback(false)
                }
            });
        // If active
        } else if(post !== null && post.get('active')) {
            console.log('in else if');
            successCallback(false);
        // If it exists but is not active - activate again
        } else {
            console.log('in else');
            Log.update({
                id: id,
                active: true
            }, (err, post) => {
                console.log(err);
                console.log(post);
                successCallback(true);
            });
        }
    });
}

function setStop(user, today, cb) {
    Log
        .query(user)
        .usingIndex('userIndex')
        .descending()
        .limit(1)
        .exec((err, post) => {
            if (!err && post.Items && post.Items.length > 0 && post.Items[0].attrs['active']) {
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
                    console.log(err);
                    console.log(post);
                    cb(ticket, newCounter);
                });
            } else {
                cb(null, null);
            }
            console.log(post);
        });
}

module.exports = {
    setStart: setStart,
    setStop: setStop,
};