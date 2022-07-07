const Factory = require('../factory')
const Utils = require('./utils')
const _ = require("lodash");

//
// Initialize the child logger for
// the module
//
const log = require('../log').child({
  module: 'directChannels'
})

module.exports = async function(context) {
  // Select all of the rooms
  const collection = context.rocketchat.roomsCollection()
  const query = { t: 'd' }

  const directChannels = {}
  const cursor = collection.find(query)
  const mergeDiscussions = _.get(context, 'config.define.channels.mergeDiscussionIntoParent', false)
  const discussions = {}
  while (await cursor.hasNext()) {
    const result = await cursor.next()
    if (mergeDiscussions && result.prid) {
      discussions[result._id] = result.prid
      log.info(`... skipping direct channel ${result._id} to merge discussion into parent ${result.prid}`)
      continue;
    }

    try {
      // Generate the members array for the direct channel
      let members = Utils.members(
        context.values.users,
        result.uids,
      )
      if (members.length === 1) {
        members.push(members[0])
      }
      // If there at least two members
      if (Utils.membersAreValid(members)) {
        log.info(`... writing members (${members.join(', ')})`)
        let channel = directChannels[result._id] = {
          header: result.topic,
          members
        }
        context.output.write(
          Factory.directChannel(channel)
        )
      }
    } catch (err) {
      log.error(`... ignoring directChannel members (${result.usernames.join(', ')}) on error: ${err.message}.`)
    }
  }
  if (!context.values.discussions) {
    context.values.discussions = {}
  }
  context.values.discussions = Object.assign(context.values.discussions, discussions)
  context.values.directChannels = directChannels
  return context
}
