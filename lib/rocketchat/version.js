const Factory = require('../factory')

module.exports = function(context) {
  //
  // Write the version object
  //
  context.output.write(Factory.version())
  //
  // Return a resolved promise
  //
  return Promise.resolve(context)
}
