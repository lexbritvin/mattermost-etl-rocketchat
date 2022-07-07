const _ = require('lodash')
const fs = require('fs')
const path = require('path')

//
// Declare utils object
//
const utils = {}

//
//
//
utils.chunk = function(body) {
  //
  // Use regex to create an array
  // of strings of max length
  //
  return body.match(/[\s\S]{1,4000}/g)
}

//
// Lookup values
//
utils.lookup = function (type, map, key) {
  var found = map[key]

  if(!found) {
    throw new Error(`${type} ${key} not found`)
  }

  return found
}

//
// Obtain the username from a jid
//
utils.username = function (users, id) {
  return utils.lookup('user', users, id).username
}

//
// Obtain the channel name from a jid
//
utils.channelName = function (channels, id) {
  return utils.lookup('channel', channels, id).name
}

//
// Find the message body
//
utils.body = function (body) {
  return utils.chunk(body)
}

utils.processAttachments = function (context, message) {
  if (!message.attachments) {
    return []
  }
  return message.attachments.map((attachment) => {
    if (attachment.type && attachment.type === 'file') {
      return {
        type: 'file',
        data: utils.processFileAttachment(context, message, attachment),
      }
    }
    if (attachment.text) {
      return {
        type: 'quote',
        data: utils.processQuoteAttachment(message, attachment)
      }
    }
    return {
      type: 'unknown'
    }
  })
}

utils.processQuoteAttachment = function (message, attachment) {
  if (!attachment.text) {
    return ''
  }
  const body = (message.msg || '').replace(/\[ \]\(.*msg=.*?\) /, '')
  // Convert quote to markdown
  return `@${attachment.author_name}:\n ${attachment.text.replace(/^/, '> ')} \n\n${body}`
}

utils.processFileAttachment = async function (context, message, attachment) {
  if (!message.file) {
    return new Error(`message ${message._id} file is missing`)
  }
  const collection = context.rocketchat.uploadsCollection()
  return {
    description: attachment.description,
    path: await utils.exportFile(context, collection, message.file._id),
  }
}

utils.srcPath = function (srcDir, filename) {
  const files = fs.readdirSync(srcDir).filter((fn) => fn.startsWith(filename));
  if (files.length !== 1) {
    return false
  }
  return `${srcDir}/${path.basename(files[0])}`
}

utils.destPath = function (destDir, type, file) {
  let dest = `${destDir}/${type}/${file._id}/${file.name}`;
  const ext = path.extname(dest)
  if (!ext || !/^\.[A-Za-z][A-Za-z0-9]*$/.test(ext)) {
    if (file.identify && file.identify.format) {
      dest += '.' + file.identify.format
    } else {
      dest += '.' + file.type.split('/')[1]
    }
  }
  return dest
}

utils.exportFile = async function (context, collection, fileId) {
  const type = collection.collectionName
  const file = await collection.findOne({ _id: fileId })
  if (!file) {
    throw new Error(`file ${fileId} from collection ${type} is missing`)
  }
  const dest = context.config.target.filesPath
  const destFilename = utils.destPath(dest, collection.collectionName, file)

  if (file.store.startsWith('FileSystem:')) {
    const src = context.config.source.uploadsPath
    const srcFilename = utils.srcPath(src, file._id)
    if (!srcFilename) {
      return new Error(`source file "${file._id}" not found`)
    }
    // Copy to output dir
    utils.copyFile(srcFilename, destFilename)
  } else if (file.store.startsWith('GridFS:')) {
    await utils.downloadGridFS(context, collection, file._id, destFilename)
  } else {
    throw new Error(`file system ${file.store} is not supported. Migrate to FileSystem first, see readme.`)
  }

  return destFilename
}

utils.copyFile = function (src, dest) {
  if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest), { recursive: true })
  }
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest)
  }
}

utils.downloadGridFS = async function (context, collection, id, dest) {
  if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest), { recursive: true })
  }
  if (fs.existsSync(dest)) {
    fs.unlinkSync(dest)
  }

  const bucket = context.rocketchat.gridFsBucket(collection.collectionName)
  const destStream = fs.createWriteStream(dest);
  bucket.openDownloadStream(id).pipe(destStream);
  return new Promise((resolve, reject) => {
    destStream.on('finish', resolve);
  })
}

utils.members = function(users, usernames) {
  return _.uniq(_.sortBy(usernames.map((username) => utils.username(users, username))))
}

//
// Checks if the members list is valid
//
utils.membersAreValid = function(members) {
  return _.isArray(members) && members.length > 0
}

//
// Convert ISO to millis
//
utils.millis = function(date) {
  return new Date(date).getTime()
}

//
// Export the functions
//
module.exports = utils
