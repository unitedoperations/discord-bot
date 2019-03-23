# Changelog

## v3.1.0

- HOTFIX rules for logging and auditing server actions

## v3.0.0

- ADD bot auditing for deleted and edited messages
- ADD bot auditing for command usage
- ADD bot auditing for authentication system's role changes
- UPDATE finalize authentication system support and communication
- UPDATE command use bot log format to match new delete and update logs

## v2.9.0

- ADD `pusher-js` capabilities for hooking in the event stream served by the UO Authenticator for providing and revoking user permissions
- ADD `Steel Beasts` Discord role to the approved list for `join_group` and `leave_group`. **Replace all spaces with underscores in role names when running the command**
- UPDATE flight and LFG groups expire after 8 hours
- UPDATE calendar event notification intervals
- UPDATE temporarily disable `!ready` command until primary server features are updated to be compatible
- REMOVE FTP related environment variable dependencies since transition to forums API for mission searching

## v2.8.0

- ADD separate store to house and manage Discord channel functionality and IDs
- ADD separate store for housing environment variables
- ADD `!ready count` subcommand to see how many users are waiting for player count alerts
- ADD regular role access restriction to the `!polls` command
- UPDATE point calendar event manager to the new forum API
- UPDATE new member welcome message with updated linked to wiki and forums pages
- UPDATE clean up usage of `process.env` across the whole code-base
- UPDATE expand `.env` to contain more configurable variables for flexibility
- UPDATE the poll thread fetching and notification mechanisms. Now undeprecated
- UPDATE `!missions` command to use forums API instead of FTP access
- FIX naming of UOAF flights generated from `!flight create` command
- FIX several architectural flaws to make the bot more efficient in its processes
- REMOVE `!config` command
- Temporarily deprecate primary server notifier and `!primary` command

## v2.7.0

- ADD `!announce` admin command for announcing new versions of the bot
- FIX bot no longer controls upgrade messaging to general chat
- FIX tagging UOAF group for new pickups flights
- UPDATE Terraform CI/CD
- UPDATE error handling for Discord client

## v2.6.0

- ADD Terraform scripts for infrastructural automation
- ADD statistics capturing and `!stats` command for admins to view
- ADD `!flight` series of commands for UOAF member to manage pickup flights - similar system to `!lfg` commands
- UPDATE `!ready` to inform when an alarm was overridden

## v2.5.0

- ADD `!ready` command to register for player count alerts
- ADD mission feedback link on new mission alerts to Discord
- ADD `!sqfp` command to post results publicly as reference
- UPDATE help output to be embed message type
- UPDATE code refactoring for performance and cleaning
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
