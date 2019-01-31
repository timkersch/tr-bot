'use strict';
const Joi = require('joi');
const dynamo = require('dynamodb');

const Log = dynamo.define('Log', {
    hashKey: 'user',
    rangeKey: 'dateTicket',
    timestamps: true,

    schema: {
        user: Joi.string(),
        date: Joi.string().regex(/\d{4}-\d{2}-\d{2}/),
        ticket: Joi.string().allow('').default(''),
        dateTicket: Joi.string().regex(/\d{4}-\d{2}-\d{2}_\S*/),
        counter: Joi.number().default(0),
        active: Joi.boolean().default(true)
    },

    indexes : [{
        hashKey : 'user', rangeKey : 'updatedAt', name : 'userDate', type : 'global'
    }],

    tableName: 'logs'
});

module.exports = {
    Log: Log,
}