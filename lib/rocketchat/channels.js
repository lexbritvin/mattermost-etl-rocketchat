const _ = require('lodash')
const Factory = require('../factory')
const slug = require("slug");

//
// Initialize the child logger for
// the module
//
const log = require('../log').child({
  module: 'channels'
})

module.exports = async function (context) {
  const collection = context.rocketchat.roomsCollection()
  const query = { t: { $in: ['c', 'p'] } }

  let channels = {}
  const cursor = collection.find(query)
  const mergeDiscussions = _.get(context, 'config.define.channels.mergeDiscussionIntoParent', false)
  const discussions = {}
  while (await cursor.hasNext()) {
    const result = await cursor.next()
    if (mergeDiscussions && result.prid) {
      discussions[result._id] = result.prid
      log.info(`... skipping channel ${result._id} to merge discussion into parent ${result.prid}`)
      continue;
    }
    
    // Get discussion full name
    if (result.prid){
      _name = slug(_.toLower(result.fname));
      _display_name = result.fname;
    } else {
      _name = slug(_.toLower(result.name));
      _display_name = result.name;
    }

    // Define the channel and add it to the context
    let channel = channels[result._id] = {
      team: context.values.team.name,
      name: _name,
      display_name: _display_name,
      header: result.topic,
      purpose: result.description,
      type: result.t === 'p' ? 'P' : 'O'
    }
    const map = _.get(context, `config.define.channels.map.${result.name}`, false)
    if (map) {
      channel.name = map.name
      channel.display_name = map.display_name
    }
    // Write the channel data to the output
    log.info(`... writing ${channel.name} (${result.name})`)
    context.output.write(
      Factory.channel(channel)
    )
  }
  if (!context.values.discussions) {
    context.values.discussions = {}
  }
  context.values.discussions = Object.assign(context.values.discussions, discussions)
  context.values.channels = channels
  return context
}
