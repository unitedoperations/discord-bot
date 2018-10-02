# Changelog

## v2.5.0

- ADD `!ready` command to register for player count alerts
- ADD mission feedback link on new mission alerts to Discord
- ADD `!sqfp` command to post results publicly as reference
- UPDATE help output to be embed message type
- FIX calendar naming conventions to include `Event: ...` prefix

## v2.4.0

- ADD additional error handling
- ADD `!sqf` command to provide wiki links for searched SQF commands
- ADD `!missions` to search for missions in the FTP server
- ADD beginning unit testing
- UPDATE better operation logging with timestamps
- UPDATE remove old events from cache
- DEPRECATE new poll routine until issue resolved

## v2.3.0

- ADD `!events` command to see all pending community events and links
- UPDATE improve message structure for bot responses
- UPDATE change the minimum player count on the primary server to trigger an alert from `5` to `10`
- UPDATE version control flow to edit `package.json` on updates
- REMOVE unnecessary dependencies
- REMOVE unneeded logs

## v2.2.0

- ADD allow commands through direct messages
- ADD post announcement to LFG channel when new group is created
- ADD automated notification of active LFG groups to LFG channel every 2 hours
- ADD internal guide for contributors to the project
- UPDATE `!join_group` and `!leave_group` command no longer accept the use of `@` mentioned groups, and users should now provide the group name without the `@` (i.e. `!join_group @UOA3` is now `!join_group UOA3`) in order to avoid sending pings to all group members on every join or leave
- UPDATE only rebuild on major and minor versions
- UPDATE LFG feature to only allow one active group per user at a time
- FIXED bot client not setting guild instance on ready event

## v2.1.0

- ADD improved and partially automated deployment pipeline
- ADD automatic update announcement by bot for major and minor

## v2.0.0

- ADD looking for group functionality with commands
- ADD role-based command provisioners
- UPDATE scheduling algorithm for better timing of reminders and alerts
