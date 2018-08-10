# UO Discord Bot

## Requirements and Setup

### System

A `Dockerfile` is provided in the repository is you wish to use Docker, otherwise:

- Node.js 10.8.0 or higher
- `.env` file at the root project level with the following variables set
  - `BOT_ID`: _client ID of the bot received in the developer portal_
  - `BOT_SECRET`: _client secret of the bot received in the developer portal_
  - `BOT_TOKEN`: _client token of the bot received in the developer portal_
  - `BOT_PERMISSIONS`: _integer value of the sum of the bot's permissions_
  - `DISCORD_SERVER_ID`: _ID of the server being deployed to_
  - `DISCORD_LOG_CHANNEL`: _ID of the channel designated for bot audit logs_
  - `DISCORD_MAIN_CHANNEL`: _ID of the main channel in the server_
  - `DISCORD_ARMA_CHANNEL`: _ID of the channel designated for ArmA 3_
  - `DISCORD_BMS_CHANNEL`: _ID of the channel designated for BMS_
  - `DISCORD_ALLOWED_GROUPS`: _comma deliminated list of groups/roles user's are allowed to join_
  - `DISCORD_ARMA_PLAYER_ROLE`: _the role designated for Arma 3 players_
  - `DISCORD_BMS_PLAYER_ROLE`: _the role designated for BMS players_
  - `ALERT_TIMES`: _comma deliminated list of "time untils" to post reminder notifications for calendar events. Hold the format of `<amt> <time_type>` (7 days, 12 hours)_
  - `HOURS_TO_REFRESH_CALENDAR`: _number of hours between updating the event list from the RSS feed for the calendar_
  - `SHUTDOWN_ROLES`: roles permitted to run the shutdown command to put the bot offline and stop the application from running\_

Sample `.env` file without sensitive values:

```sh
# Bot authentication configuration
BOT_ID=
BOT_SECRET=
BOT_TOKEN=
BOT_PERMISSIONS=

# Discord information configuration, channel variables are the channel IDs
DISCORD_SERVER_ID=
DISCORD_LOG_CHANNEL=
DISCORD_MAIN_CHANNEL=
DISCORD_ARMA_CHANNEL=
DISCORD_BMS_CHANNEL=
DISCORD_ALLOWED_GROUPS=UOA3,UOAF
DISCORD_ARMA_PLAYER_ROLE=UOA3
DISCORD_BMS_PLAYER_ROLE=UOAF

# All times are in hours!
# Format as: <amount> <type>
ALERT_TIMES=7 days,2 days,1 day,12 hours,2 hours,5 minutes

# Number of hours between calendar event pulls to refresh
HOURS_TO_REFRESH_CALENDAR=1

# Role(s) permitted to shutdown the bot
SHUTDOWN_ROLES=GSO,WSO
```

### Discord

Permissions for the bot should be configured as:

<img src="https://i.imgur.com/gjWLIRH.png" />

The _"Permissions Integer"_ at the bottom is the value for the environment variable `BOT_PERMISSIONS`.

1. In the _"OAuth2"_ tab of the developer portal, give the application **_only_** the `bot` scope, then configure with the permission set above.

2. Copy and paste the generated OAuth2 URL into the browser and select the Discord server to give access to the bot to join.

3. Insert all sensitive authentication data into the environment variables file from the developer portal.

4. You can copy the IDs of the server and channels by right clicking on them while in Discord's _Developer Mode_, and place them with the appropriate environment variables in the `.env` file

5. Go into the Discord server options, `Server Settings > Roles`, and ensure the that the role for the bot is placed above _all_ other roles in the list

6. If the `ARMA_CHANNEL`, `BMS_CHANNEL`, or `MAIN_CHANNEL` are locked, make sure to give special permission to the bot's role for the channel:

   - Read Messages
   - Send Messages
   - Send TTS Messages
   - Manage Messages
   - Embed Links

7. Once the `Node.js` application is running, the bot will appear as _"Online"_ on the Discord server and ready to handle requests

## License

[MIT](./LICENSE)
