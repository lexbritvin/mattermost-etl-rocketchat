const config = require('./config')
const rocketchat = require('../lib/mongo')


rocketchat.messagesCollection = function () {
  return rocketchat.collection('rocketchat_message')
}

rocketchat.roomsCollection = function () {
  return rocketchat.collection('rocketchat_room')
}

rocketchat.usersCollection = function () {
  return rocketchat.collection('users')
}

rocketchat.uploadsCollection = function () {
  return rocketchat.collection('rocketchat_uploads')
}

rocketchat.avatarsCollection = function () {
  return rocketchat.collection('rocketchat_avatars')
}

rocketchat.emojiCollection = function () {
  return rocketchat.collection('rocketchat_custom_emoji')
}

module.exports = {
  config,
  rocketchat,
  values: {
    //
    // Cached values can be stored
    // here
    //
  }
}
