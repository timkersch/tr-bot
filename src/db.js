'use strict';

const dynamo = require('dynamodb');
dynamo.AWS.config.update({accessKeyId: '', secretAccessKey: '', region: "us-east-1"});

const Logging = require('./dbModel').Logging;

function setStart(user, today) {
    const id = user.concat(today);
    Logging.create({
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
    Logging.update({
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