//
// Initialize the child logger for
// the module
//
const log = require('../log').child({
  module: 'end'
})

module.exports = function(context) {
  log.info('end')
  context.rocketchat.close()
  context.output.end()
}
