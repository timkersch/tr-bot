'use strict';

const dynamo = require('dynamodb');
dynamo.AWS.config.update({accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET, region: "us-east-1"});

const Log = require('./dbModel').Log;

function isActive(user, today) {
    return new Promise((resolve, reject) => {
        Log
        .query(user)
        .where('dateTicket').beginsWith(today)
        .filter('active').equals(true)
        .exec((err, post)  => {
            if (post && post.Count > 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

function setStart(user, today, ticket) {
    return new Promise((resolve, reject) => {
        const dateTicket = today.concat('_').concat(ticket);
    
        // See if this ID already exists
        Log.get(user, dateTicket, (err, post) => {
            // If it does not exist
            if (post === null) {
                // See if there are any other entries of this date
                isActive(user, today).then(active => {
                    if (active) {
                        reject('You already have on active logging. Please stop it with /stop before starting a new.');
                    } else {
                        Log.create({
                            user: user,
                            date: today,
                            dateTicket: dateTicket,
                            ticket: ticket,
                            active: true,
                            counter: 0,
                        }, (err, _) => {
                            err ? reject(err) : resolve();
                        });
                    }              
                });

            // If it exists and is active
            } else if(post && post.get('active')) {
                reject('You already have on active logging. Please stop it with /stop before starting a new.');
            
            // If it exists but is not active - activate again
            } else {
                isActive(user, today).then((active) => {
                    if (active) {
                        reject('You already have on active logging. Please stop it with /stop before starting a new.');
                    } else {
                        Log.update({
                            user: user,
                            dateTicket: dateTicket,
                            active: true
                        }, (err, _) => {
                            err ? reject(err) : resolve();
                        });
                    }
                });
            }
        });
    });
}

function setStop(user, today) {
    return new Promise((resolve, reject) => {
        Log
        .query(user)
        .where('dateTicket').beginsWith(today)
        .filter('active').equals(true)
        .exec((err, post) => {
            if (!err && post && post.Count > 0) {
                const attrs = post.Items[0].attrs;
                const dateTicket = attrs['dateTicket'];
                const ticket = attrs['ticket']
                const counter = attrs['counter'];
                
                // Latest time modified is either when it was created or updated
                const latestModified = new Date(attrs['updatedAt'] ? attrs['updatedAt'] : attrs['createdAt']);
                const timeDiff = Date.now() - latestModified.getTime();
                const newCounter = counter + timeDiff;
                Log.update({
                    user: user,
                    dateTicket: dateTicket,
                    counter: newCounter,
                    active: false
                }, (err, _) => {
                    err ? reject(err) : resolve({'ticket': ticket, 'timeDiff': timeDiff});
                });
            } else {
                reject('You do not have any active time logging. Please start a new logging with /start ticket-id before stopping.');
            }
        });
    });
}

module.exports = {
    setStart: setStart,
    setStop: setStop,
};