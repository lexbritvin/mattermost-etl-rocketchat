module.exports = {
  source: {
    uri: 'mongodb://user:password@host:27017/rocketchat?authSource=admin&directConnection=true',
    uploadsPath: './uploads',
    customEmojiPath: './custom_emoji',
  },
  target: {
    filename: 'data.jsonl',
    filesPath: './files'
  },
  define: {
    team: {
      name: 'my-team-name',
      display_name: 'My Team Name',
      description: 'An example of a team',
      type: 'I',
      allow_open_invite: true
    },
    channels: {
      mergeDiscussionIntoParent: true,
      map: {
        general: {
          name: 'town-square',
          display_name: 'Town Square'
        }
      }
    },
    user: {
      ldap_auth_service: 'gitlab',
      gitlab: {
        host: 'https://gitlab.example.com',
        token: 'token',
      },
      globalRoleMap: {
        admin: 'system_admin',
        user: 'system_user',
      },
    }
  }
}
