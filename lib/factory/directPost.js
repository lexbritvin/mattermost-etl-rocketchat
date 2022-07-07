const Joi = require('joi')
const validate = require('./validate')
const postPartial = require('./postPartial')

//
// Define the schema
//
const schema = {
  channel_members: Joi.array().items(Joi.string()).min(2),
  ...postPartial,
}

//
// Generate a valid object
//
module.exports = function (props) {
  return {
    type: 'direct_post',
    direct_post: validate(schema, props)
  }
}
