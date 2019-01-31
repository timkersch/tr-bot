'use strict';
require('dotenv').config({ path: '../' })
const Joi = require('joi');

// Include the serverless-slack bot framework
const slack = require('serverless-slack');
const db = require('./db');

// The function that AWS Lambda will call
exports.handler = slack.handler.bind(slack);

slack.on('/start', (msg, bot) => {
  console.log('in start');
  console.log(msg);
  
  const ticket = msg['text'] ? msg['text'] : '';
  const user = msg['user_id'];
  db.setStart(user, '2018-01-01', ticket, (success) => {
    if (success) {
      let text = '';
      if (ticket) {
        text = 'Okay, time logging for ticket: ' + ticket + ' started';
      } else {
        text = 'Okay, time logging started.';
      }
      const message = {
        text: text
      };
      bot.replyPrivate(message); 
    } else {
      bot.replyPrivate({text: 'You already have on active logging. Please stop it with /stop before starting a new.'});
    }
  });
});

slack.on('/stop', (msg, bot) => {
  console.log('in stop');
  console.log(msg);
  
  const user = msg['user_id'];
  // TODO display which ticket was in progress and how long it was logged for
  db.setStop(user, '2018-01-01', (ticket, time) => {
    let text;
    if (ticket == null && time == null) {
      text = "You don't have any active time logging. Please start a new logging with /start ticket-id before stopping."
    } else {
      text = "Okay, time logging ended.";
    }
    bot.replyPrivate({text: text}); 
  });
});

slack.on('/export', (msg, bot) => {
  console.log('in export');
  console.log(msg);

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
  console.log('in export click');
  console.log(msg);

  const res = msg.actions[0].value;
  let message = { 
    text: res 
  };  
  bot.replyPrivate(message);
});
