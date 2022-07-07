const Factory = require('../factory')
const Utils = require('./utils')
const _ = require('lodash')

//
// Initialize the child logger for
// the module
//
const log = require('../log').child({
  module: 'posts'
})

module.exports = async function (context) {
  const collection = context.rocketchat.messagesCollection()
  // Keep track of the number of posts written for logging
  let written = 0

  let memReplyIds = {}
  const total = await collection.count()
  const cursor = collection.find()
  while (await cursor.hasNext()) {
    const result = await cursor.next()
    let posts = await collectPostData(context, result, memReplyIds, false)
    posts.forEach(function(post) {
      context.output.write(post.isDirect ? Factory.directPost(post) : Factory.post(post))
    })
    // Log progress periodically
    written += posts.length
    if (written % 1000 == 0) {
      log.info(`... wrote ${written} posts`)
    }
  }
  log.info(`... finished exporting ${written} posts, ignored ${total - written}`)
  return context
}

async function collectPostData(context, result, memReplyIds, isReply) {
  if (memReplyIds.hasOwnProperty(result._id)) {
    return []
  }

  try {
    // Try to get discussion channel id
    let channelId = result.rid
    const mergeDiscussions = _.get(context, 'config.define.channels.mergeDiscussionIntoParent', false)
    const parentId = _.get(context, `values.discussions.${channelId}`, false)
    if (mergeDiscussions && parentId) {
      channelId = parentId
    }
    // Check if direct message
    let isDirect = !context.values.channels[channelId] && !!context.values.directChannels[channelId]
    let post = {}
    let channelInfo = {}

    if (isDirect) {
      let { members: channel_members } = context.values.directChannels[channelId]
      // Ensure we have at least two channel members before we can write the message
      if (Utils.membersAreValid(channel_members)) {
        channelInfo = { channel_members }
      } else {
        log.error(`... ignoring message id:${result._id} on error: directChannel ${channelId} not found.`)
        return []
      }
    } else {
      channelInfo = {
        team: context.values.team.name,
        channel: Utils.channelName(
          context.values.channels, channelId
        ),
      }
    }
    if (!isReply) {
      Object.assign(post, channelInfo)
    }

    const reactions = Object.keys(result.reactions || {}).reduce((prev, code) => {
      return result.reactions[code].usernames.map((u) => {
        return {
          user: u,
          emoji_name: _.trim(code, ':'),
          create_at: Utils.millis(result.ts),
        }
      }).concat(prev)
    }, [])
    const flagged_by = (result.starred || []).map(({ _id: uid }) => {
      try {
        return Utils.username(context.values.users, uid)
      } catch (err) {
        return undefined
      }
    }).filter(v => v)

    Object.assign(post, {
      user: Utils.username(
        context.values.users, result.u._id
      ),
      create_at: Utils.millis(result.ts),
      reactions,
      flagged_by,
      isDirect,
    })

    // Collect data from attachments
    let attachments = Utils.processAttachments(context, result)
    let file
    let body = result.msg

    await Promise.all(attachments.map(async (a) => {
      if (a.type === 'file') {
        file = await a.data
      } else if (a.type === 'quote') {
        body = a.data
      }
    }))
    if (file && file instanceof Error) {
      throw file
    }

    if (file && file.description) {
      body = `File description: \n${file.description} \n\n ${body}`
    }
    const chunks = body ? Utils.body(body) : [body]
    let posts = chunks.map((chunk) => {
      return Object.assign({}, post, {
        message: chunk
      })
    })

    if (!posts[0]) {
      throw new Error(`Post is empty`)
    }

    if (file) {
      posts[0].attachments = [{
        path: file.path
      }]
    }

    const replies = []
    if (!isReply) {
      const collection = context.rocketchat.messagesCollection()
      const cursor = collection.find({tmid: result._id })
      while (await cursor.hasNext()) {
        const reply = await cursor.next()
        const replyData = await collectPostData(context, reply, memReplyIds, true)
        replyData.forEach(r => replies.push(r))
        memReplyIds[reply._id] = true
      }
    }

    Object.assign(posts[0], {
      reactions,
      flagged_by,
      replies,
    })

    return posts
  } catch (err) {
    log.error(`... ignoring message id:${result._id} on error: ${err.message}.`)
    return []
  }
}
