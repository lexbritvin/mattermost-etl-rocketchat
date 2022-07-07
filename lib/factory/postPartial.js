const Joi = require('joi')

const attachment = Joi.object({
  path: Joi.string()
})

const reaction = Joi.object({
  user: Joi.string(),
  emoji_name: Joi.string(),
  create_at: Joi.number(),
})

const messagePartial = {
  user: Joi.string(),
  message: Joi.string().allow(''),
  attachments: Joi.array().items(attachment).optional(),
  flagged_by: Joi.array().items(Joi.string()).optional(),
  reactions: Joi.array().items(reaction).optional(),
  create_at: Joi.number(),
}

const reply = Joi.object().keys(messagePartial)

//
// Define the schema
//
module.exports = {
  ...messagePartial,
  replies: Joi.array().items(reply).optional(),
}

