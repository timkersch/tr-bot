'use strict';
require('dotenv').config({ path: '../' })
const Joi = require('joi');

// Include the serverless-slack bot framework
const slack = require('serverless-slack');
const db = require('./db');

// The function that AWS Lambda will call
exports.handler = slack.handler.bind(slack);

function getDate(offset) {
  const date = new Date(); 
  date.setTime(date.getTime() + (offset*1000));
  return date.toISOString().split('T')[0];
}
 
slack.on('/start', (msg, bot) => {
  const ticket = msg['text'] ? msg['text'] : '';
  const user = msg['user_id'];

  bot.send('users.info', { user: user }).then(data => {
    const day = getDate(data['user']['tz_offset']);

    db.setStart(user, day, ticket).then((success) => {
      let text = '';
      if (ticket) {
        text = 'Time logging for ticket: ' + ticket + ' started';
      } else {
        text = 'Time logging started.';
      }
      bot.replyPrivate({text: text}); 
    }).catch((err) => {
      bot.replyPrivate({text: err});
    });
  }).catch((err) => {
    bot.replyPrivate({text: 'Seems like you are not have not authenticated the app. Head over to: https://bx8m06qy1h.execute-api.us-east-1.amazonaws.com/dev/slack'});
  });
});

slack.on('/stop', (msg, bot) => {  
  const user = msg['user_id'];

  bot.send('users.info', { user: user }).then(data => {
    const day = getDate(data['user']['tz_offset']);

    db.setStop(user, day).then((res) => {
      const time = res['timeDiff'];
      const ticket = res['ticket'];
      
      let text = "Time logging ended. Logged: " + (time / (1000*60*60)).toFixed(2) + " hours";
      if (ticket && ticket !== '') {
        text = text.concat(' on ticket: ' + ticket);
      }
      bot.replyPrivate({text: text}); 
    }).catch((err) => {
      bot.replyPrivate({text: err});
    });

  }).catch((err) => {
    bot.replyPrivate({text: 'Seems like you are not have not authenticated the app. Head over to: https://bx8m06qy1h.execute-api.us-east-1.amazonaws.com/dev/slack'});
  });
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
