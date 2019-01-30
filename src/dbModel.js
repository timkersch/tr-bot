'use strict';

const dynamo = require('dynamodb');
const Joi = require('joi');

const Log = dynamo.define('Log', {
    hashKey: 'id',
    timestamps: true,

    schema: {
        id: Joi.string(),
        user: Joi.string(),
        date: Joi.string(),
        counter: Joi.number(),
    },

    tableName: 'logs'
});

module.exports = {
    Log: Log,
}