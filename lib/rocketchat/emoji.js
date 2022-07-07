const Factory = require('../factory')
const Utils = require('./utils')

//
// Initialize the child logger for
// the module
//
const log = require('../log').child({
  module: 'custom emoji'
})

module.exports = async function (context) {
  const collection = context.rocketchat.emojiCollection()
  const fileCollection = context.rocketchat.collection('custom_emoji')

  const cursor = collection.find()
  while (await cursor.hasNext()) {
    const result = await cursor.next()

    // Prepare destination file
    const filename = `${result.name}.${result.extension}`
    const dest = `${context.config.target.filesPath}/custom_emoji/${filename}`
    // Download emoji file
    if (result.store.startsWith('FileSystem:')) {
      const src = context.config.source.customEmojiPath
      const srcFilename = Utils.srcPath(src, filename)
      if (!srcFilename) {
        return new Error(`source file "${filename}" not found`)
      }
      // Copy to output dir
      Utils.copyFile(srcFilename, dest)
    } else if (result.store.startsWith('GridFS:')) {
      await Utils.downloadGridFS(context, fileCollection, filename, dest)
    } else {
      throw new Error(`file system ${file.store} is not supported. Migrate to FileSystem first, see readme.`)
    }

    // Export custom emoji
    let emoji = {
      name: result.name,
      image: dest,
    }
    log.info(`... writing ${emoji.name}`)
    context.output.write(
      Factory.emoji(emoji)
    )
  }
  return context
}

const exportFile = async function (context, collection, fileId) {
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