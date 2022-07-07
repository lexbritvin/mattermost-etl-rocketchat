const Factory = require('../factory')
const Utils = require('./utils')
const { Gitlab } = require('@gitbeaker/node')
const _ = require('lodash')

//
// Initialize the child logger for
// the module
//
const log = require('../log').child({
  module: 'users'
})

module.exports = async function(context) {
  const collection = context.rocketchat.usersCollection()

  let users = {}
  const cursor = collection.find({ type: 'user' })
  while (await cursor.hasNext()) {
    const result = await cursor.next()
    const id = result._id
    const [first_name, last_name] = result.name.split(' ')
    try {
      const ldapAuthService = _.get(context, 'config.define.user.ldap_auth_service', '')
      const roleMap = _.get(context, 'config.define.user.globalRoleMap', {})
      const auth_service = result.ldap ? ldapAuthService : ''
      if (result.roles.indexOf('admin') !== -1 && result.roles.indexOf('user') === -1) {
        result.roles.push('user')
      }
      const highlights = _.get(result, 'settings.preferences.highlights', [])
      let user = users[id] = {
        username: result.username,
        first_name,
        last_name,
        auth_service,
        auth_data: await getAuthData(context, result, auth_service),
        email: result.emails[0].address,
        roles: result.roles.sort().reduce((roles, role) => {
          if (roleMap.hasOwnProperty(role)) {
            roles.push(roleMap[role])
          }
          return roles
        }, []).join(' '),
        teams: [{
          name: context.values.team.name,
          channels: result.__rooms.map((id) => {
            const name = _.get(context, `values.channels.${id}.name`, false)
            return name ? { name } : undefined
          }).filter(v => v)
        }],
        notify_props: {
          mention_keys: highlights.map(s => s.replace('@', '')).join(','),
        },
      }
      if (auth_service) {
        user.auth_service = auth_service
        user.auth_data = await getAuthData(context, result, auth_service)
      }
      if (!user.roles.length) {
        delete user.roles
      }
      const avatar = await getAvatar(context, result)
      if (avatar) {
        user.profile_image = avatar
      }

      context.output.write(
        Factory.user(user)
      )
      log.info(`... writing ${user.username}`)
    }
    catch(err) {
      log.error(`... ignoring ${result.username} on error: ${err.message}.`)
      delete users[id]
    }
  }
  context.values.users = users
  return context
}

async function getAuthData(context, user, auth_service) {
  switch (auth_service) {
    case 'gitlab':
      const {host, token} = _.get(context, 'config.define.user.gitlab')
      const api = new Gitlab({ host, token });
      const gitlabUser = await api.Users.username(user.username);
      if (!gitlabUser || !gitlabUser.length) {
        throw new Error(`user ${user.username} is missing in Gitlab`)
      }
      return `${gitlabUser[0].id}`
    case 'ldap':
      return user.username.toUpperCase()
    default:
      return ''
  }
}

async function getAvatar(context, user) {
  const collection = context.rocketchat.avatarsCollection()
  const avatar = await collection.findOne({userId: user._id}, {sort: {_updatedAt: -1}})
  if (!avatar) {
    return ""
  }
  return Utils.exportFile(context, collection, avatar._id)
}
