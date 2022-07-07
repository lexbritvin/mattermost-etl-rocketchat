const Factory = require('../factory')

//
// Initialize the child logger for
// the module
//
const log = require('../log').child({
  module: 'team'
})

module.exports = function(context) {
  log.info(`writing team '${context.config.define.team.name}'`)
  //
  // Store the team object for use
  // by other modules
  //
  context.values.team = context.config.define.team
  //
  // Write the team object to the
  // output
  //
  context.output.write(Factory.team(
    context.config.define.team
  ))
  //
  // Return a resolved promise
  //
  return Promise.resolve(context)
}
