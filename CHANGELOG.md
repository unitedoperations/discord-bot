# Changelog

## v2.2.0

- ADD allow commands through direct messages
- ADD post announcement to general channel when new LFG group is created
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
