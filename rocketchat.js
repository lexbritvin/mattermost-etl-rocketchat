const context = require('./context/rocketchat')
const log = require('./lib/log')
const {
  start,
  version,
  emoji,
  team,
  channels,
  users,
  posts,
  directChannels,
  end
} = require('./lib/rocketchat')

//
// Common function log errors and
// terminate the process
//
const abort = function (err) {
  log.error(err)
  //
  // We set a timeout here to
  // allow the log streams to finish
  // writing.
  //
  setTimeout(function () {
    process.exit(1)
  }, 3000)
}

//
// Ensure we trap uncaught exceptions
// and properly abort
//
process.on('uncaughtException', abort)

start(context)
  .then(version)
  .then(emoji)
  .then(team)
  .then(channels)
  .then(users)
  .then(directChannels)
  .then(posts)
  .then(end)
  .catch(abort)