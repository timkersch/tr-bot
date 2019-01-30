'use strict';

const dynamo = require('dynamodb');
dynamo.AWS.config.update({accessKeyId: '', secretAccessKey: '', region: "us-east-1"});

const Log = require('./dbModel').Log;

function setStart(user, today) {
    console.log('Set start')
    const id = user.concat(today);
    console.log(id);
    Log.create({
        id: id,
        user: user,
        date: today,
        counter: 0,
    }, (err, post) => {
        console.log(err);
        console.log(post);
    });
}

function setStop(user, today) {
    const id = user.concat(today);
    Log.update({
        id: id,
        counter: 0
    }, (err, post) => {
        console.log(err);
        console.log(post);
    });
}

module.exports = {
    setStart: setStart,
    setStop: setStop,
};