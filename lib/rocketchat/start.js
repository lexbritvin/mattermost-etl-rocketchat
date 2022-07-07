const datafile = require('../datafile')
const fs = require('fs');

//
// Initialize the child logger for
// the module
//
const log = require('../log').child({
  module: 'start'
})

module.exports = async function(context) {
  log.info('preparing files paths')
  const dest = context.config.target.filesPath
  if (!dest || !fs.existsSync(dest)) {
    fs.mkdirSync(dest)
  }
  if (!fs.lstatSync(dest).isDirectory() || fs.accessSync(dest, fs.constants.W_OK)) {
    throw new Error(`Directory "${dest} is not writable"`)
  }

  log.info('connecting to rocketchat')
  await context.rocketchat.connect(context.config)
  log.info(`creating file '${context.config.target.filename}'`)
  // Create the datafile and add it to the context
  context.output = datafile(
    context.config.target.filename,
    process.exit
  )

  return context
}
