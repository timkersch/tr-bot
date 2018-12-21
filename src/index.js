'use strict';
const Joi = require('joi');

// Include the serverless-slack bot framework
const slack = require('serverless-slack');
const db = require('./db');

// The function that AWS Lambda will call
exports.handler = slack.handler.bind(slack);

slack.on('/start', (msg, bot) => {
  const param = msg['text'];
  const user = msg['user_id'];
  db.setStart(user, '2018-01-01');
  let message = {
    text: "Okay, time logging started."
  };
  bot.replyPrivate(message); 
});

slack.on('/stop', (msg, bot) => {
  const user = msg['user_id'];
  db.setStop(user, '2018-01-01');
  let message = {
    text: "Okay, time logging ended."
  };
  bot.replyPrivate(message); 
});

slack.on('/export', (msg, bot) => {
  const user = msg['user_id'];
  let message = {
    text: "Sure, what do you want to export?",
    attachments: [{
      fallback: 'actions',
      callback_id: "export_click",
      actions: [
        { type: "button", name: "Week", text: "This week", value: "week" },
        { type: "button", name: "Month", text: "This month", value: "month" },
        { type: "button", name: "Year", text: "This year", value: "year" },
        { type: "button", name: "All", text: "Everything", value: "all" }
      ]
    }]
  };
  bot.replyPrivate(message); 
});

// Interactive Message handler
slack.on('export_click', (msg, bot) => {
  const res = msg.actions[0].value;
  let message = { 
    text: res 
  };  
  bot.replyPrivate(message);
});
