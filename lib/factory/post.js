const Joi = require('joi')
const validate = require('./validate')
const postPartial = require('./postPartial')

//
// Define the schema
//
const schema = {
  team: Joi.string(),
  channel: Joi.string(),
  ...postPartial,
}

//
// Generate a valid object
//
module.exports = function (props) {
  return {
    type: 'post',
    post: validate(schema, props)
  }
}
