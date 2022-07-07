const Joi = require('joi')

module.exports = function (schema, props) {
  //
  //  Validate and remove unknown keys
  //
  var {error, value} = Joi.validate(props, schema, {
    presence: 'required',
    stripUnknown: true
  })
  //
  // Throw validation errors
  //
  if (error) {
    throw error
  }
  //
  // Return the value
  //
  return value
}
