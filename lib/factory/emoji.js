const Joi = require('joi')
const validate = require('./validate')

//
// Define the schema
//
const schema = {
  name: Joi.string(),
  image: Joi.string(),
}

//
// Generate a valid object
//
module.exports = function (props) {
  return {
    type: 'emoji',
    emoji: validate(schema, props)
  }
}
