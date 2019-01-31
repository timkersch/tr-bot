'use strict';
const Joi = require('joi');
const dynamo = require('dynamodb');

const Log = dynamo.define('Log', {
    hashKey: 'id',
    timestamps: true,

    schema: {
        id: Joi.string(),
        user: Joi.string(),
        date: Joi.string().regex(/\d{4}-\d{2}-\d{2}/),
        ticket: Joi.string().allow('').default(''),
        date_ticket: Joi.string().regex(/\d{4}-\d{2}-\d{2}_\S*/),
        counter: Joi.number().default(0),
        active: Joi.boolean().default(true)
    },

    indexes : [{
        hashKey : 'user', rangeKey : 'date_ticket', name : 'userIndex', type : 'global'
    }],

    tableName: 'logs'
});

module.exports = {
    Log: Log,
}