'use strict';

const dynamo = require('dynamodb');
dynamo.AWS.config.update({accessKeyId: '', secretAccessKey: '', region: "us-east-1"});

const Report = require('./dbModel').Report;
const Pause = require('./dbModel').Pause;

function setStart(user, today) {
    const id = user.concat(today);
    Report.create({
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
    Report.update({
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