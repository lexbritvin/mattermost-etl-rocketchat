const Joi = require('joi')
const validate = require('./validate')

//
// Define the schema
//
const schema = {
  team: Joi.string(),
  name: Joi.string().regex(/^[a-z0-9_-]+$/),
  display_name: Joi.string(),
  header: Joi.string().allow('').optional(),
  purpose: Joi.string().allow('').optional(),
  type: Joi.string().valid('O', 'P')
}

//
// Generate a valid object
//
module.exports = function (props) {
  return {
    type: 'channel',
    channel: validate(schema, props)
  }
}
