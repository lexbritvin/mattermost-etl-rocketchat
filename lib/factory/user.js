const Joi = require('joi')
const validate = require('./validate')

const validateRoles = function (value, helper, allowed) {
  const roles = value.split(' ')
  if (value.length < 8) {
    return helper.message('Password must be at least 8 characters long')
  } else {
    return true
  }
}

//
// Define the schema
//
const schema = {
  profile_image: Joi.string().optional(),
  username: Joi.string(),
  email: Joi.string().email({
    errorLevel: true,
    minDomainAtoms: 2
  }),
  auth_service: Joi.string().valid(
    '',
    'gitlab',
    'ldap',
    'saml',
    'google',
    'office365'
  ).optional(),
  auth_data: Joi.string().optional().allow(''),
  password: Joi.string().optional(),
  nickname: Joi.string().optional(),
  first_name: Joi.string().optional(),
  last_name: Joi.string().optional(),
  position: Joi.string().optional(),
  roles: Joi.string().optional().valid(
    'system_user',
    'system_admin system_user'
  ),
  teams: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      roles: Joi.string().optional().valid(
        'team_user',
        'team_admin team_user'
      ),
      channels: Joi.array().items(
        Joi.object({
          name: Joi.string(),
          roles: Joi.string().optional().valid(
            'channel_user',
            'channel_user channel_admin'
          )
        })
      )
    })
  ),
  notify_props: Joi.object({
    mention_keys: Joi.string().optional().allow(''),
  }).optional(),
}

//
// Generate a valid object
//
module.exports = function (props) {
  return {
    type: 'user',
    user: validate(schema, props)
  }
}
