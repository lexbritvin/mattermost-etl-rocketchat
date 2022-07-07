const mongo = require('mongodb')

//
// Declare internals
//
let client = {}

//
// Connect to the db and create a connection
// pool
//
module.exports.connect = function (config) {
  client = new mongo.MongoClient(config.source.uri)
  return client.connect()
}

module.exports.close = function () {
  return client.close()
}

module.exports.collection = function (collection) {
  return client.db().collection(collection)
}

module.exports.gridFsBucket = function (bucketName) {
  return new mongo.GridFSBucket(client.db(), { bucketName })
}

