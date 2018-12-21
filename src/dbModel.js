'use strict';

const dynamo = require('dynamodb');
const Joi = require('joi');

const Logging = dynamo.define('Logging', {
    hashKey: 'id',
    timestamps: true,

    schema: {
        id: Joi.string(),
        user: Joi.string(),
        date: Joi.string(),
        counter: Joi.number(),
    }
});

module.exports = {
    Logging: Logging,
}