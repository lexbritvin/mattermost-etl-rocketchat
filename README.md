# Mattermost ETL [![CircleCI](https://circleci.com/gh/Brightscout/mattermost-etl.svg?style=shield&circle-token=3e834193f471812ea72217332aa0f5ff36825afe)](https://circleci.com/gh/Brightscout/mattermost-etl) [![Code Climate](https://codeclimate.com/github/Brightscout/mattermost-etl/badges/gpa.svg)](https://codeclimate.com/github/Brightscout/mattermost-etl) [![Test Coverage](https://codeclimate.com/github/Brightscout/mattermost-etl/badges/coverage.svg)](https://codeclimate.com/github/Brightscout/mattermost-etl/coverage)

An ETL framework to migrate data from Jabber to Mattermost. This utility exports data from a source Jabber database and generates a [Mattermost Bulk Loading](https://docs.mattermost.com/deployment/bulk-loading.html) import file. Eventually, we'll enhance this project to support migrations from other messaging sources.  



## Install

1. Install [Node.js](https://nodejs.org/en/) Version [6.11.0 LTS](https://nodejs.org/en/download/) or greater

2. Clone this repo  
`$ git clone https://github.com/Brightscout/mattermost-etl`

3. Install dependencies  
`$ cd mattermost-etl`  
`$ npm install`

4. Run tests  
`$ npm test`

## Configure

1. Copy the example config file to config.js  
`$ cp context/config.example.js context/config.js`

2. Modify the values in `context/config.js` for the source, target, and team properties.

## Export

1. Execute the ETL exporter  
`$ npm start`

2. Inspect the output file, `data.json`, or whatever you set as the target filename. Ensure the results are as [expected](https://docs.mattermost.com/deployment/bulk-loading.html#data-format).

## Export RocketChat

Export supports the following entities:

1. Users and roles. Only global roles are supported
2. Custom emoji. File storage: FileSystem and GridFS
3. Channels
4. Direct channels
5. RocketChat Discussions (subchannels) are partially supported, see below
7. User uploads. File storage: FileSystem and GridFS
8. Posts with per user flag. Channel pins are not supported by import specification.
9. Replies and Reactions

## RocketChat exporting

1. Copy the example config file to config.js  
   ```
   cp context/config.example.rocketchat.js context/config.js
   ```

2. Prepare your source and target configuration

   1. Set `source.uploadsPath` for file uploads (user avatars and file uploads)
   2. Set `source.customEmojiPath` for custom emojies
   3. Set `target.filesPath` for MM output directory

3. If you have LDAP enabled, Community version of Mattermost doesn't support LDAP. 
   If you have Community version, consider configuring ldap mapping to gitlab or disable it to use default login.  
   
   Specify it in `config.js`. Set `ldap_auth_service` to map ldap to a MM login service. 
   If it's GitLab, configure `gitlab` with `host` and `token` registered in Gitlab with User access. 
   It is used for id mapping, without it MM won't import the users and throw an error.  
   Before migrating to MM, ensure you have Gitlab integration enabled in MM and all users are present in Gitlab.

4. If you used RocketChat discussions, they will migrate in separate channels with random names. 
   You can merge discussions in parent channel with `mergeDiscussionIntoParent`
5. Global channel in Rocket Chat us **General** and in Mattermost - **Town Square**. 
   To have only 1 global channel, the configuration provides default example in `channels.map`. 
   You can specify migration for other channels as well.
6. Run migrate script with `npm run start:rocketchat`
7. Configure Mattermost (DB and Gitlab integration) before running the migration
8. Run the migration in MM

## Import

1. Run the Mattermost bulk loading command as explained [here](https://docs.mattermost.com/deployment/bulk-loading.html#running-the-bulk-loading-command)  
---

Made with &#9829; by [Brightscout](http://www.brightscout.com)
