# UO Discord Bot

## Commands

| Command          |                    Arguments                    |                                                     Description                                                     |    Permissions     |
| :--------------- | :---------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------: | :----------------: |
| `!?`, `!help`    |                        -                        |                                Displays the help output for the bot commands and use                                |        All         |
| `!about`         |                        -                        |                                          Display information about the bot                                          |        All         |
| `!alerts`        |                        -                        |                              Display the pending alerts that are scheduled in the bot                               |       Admins       |
| `!announce`      |                        -                        |                               Announce a new bot upgrade to the main Discord channel                                |       Admins       |
| `!events`        |                        -                        |                                        displays all pending community events                                        |        All         |
| `!flight list`   |                        -                        |                                         Display all pickup flights pending                                          |        All         |
| `!flight create` | sim (BMS or DCS), HH:MM zulu, MM/DD, ...details | Create a new pickup flight for the argued SIM to take place on the argued zulu time and date with any extra details |        All         |
| `!flight join`   |                    flight_id                    |                                   Join an existing pickup flight by the argued ID                                   |        All         |
| `!flight delete` |                    flight_id                    |                               Delete a pickup flight that you have created by its ID                                | All (flight owner) |
| `!join_group`    |                   group_name                    |                               Join the argued group if it exists and have permission                                |        All         |
| `!leave_group`   |                   group_name                    |                                Leave the argued group if it exists and you are in it                                |        All         |
| `!lfg list`      |                        -                        |                                   Display all group entities looking for players                                    |        All         |
| `!lfg create`    |                 #_needed, name                  |                     Create a new group with a designated name and amount of players looking for                     |        All         |
| `!lfg join`      |                    group_id                     |                                 Join a group by it's ID that is looking for players                                 |        All         |
| `!lfg delete`    |                    group_id                     |                                    Delete a group that you have create by its ID                                    | All (group owner)  |
| `!missions`      |                      name                       |            Search for mission on the FTP server with names that fully or partially match the argued name            |        All         |
| `!polls`         |                        -                        |                               Get a list of active polls/voting threads on the forums                               |     Deprecated     |
| `!ratio`         |                   total, a, b                   |                                Calculate the player ratio for teams with A:B players                                |        All         |
| `!ready`         |                      count                      |            Receive a one-time alert from the bot when the primary server reaches a certain player count             |        All         |
| `!shutdown`      |                        -                        |                                              Turns off the Discord bot                                              |       Admins       |
| `!sqf`           |                       cmd                       |                              Search the BIS wiki for information about an SQF command                               |        All         |
| `!sqfp`          |                       cmd                       |                  Search BIS wiki for information about an SQF command and post the result publicly                  |        All         |
| `!stats`         |                        -                        |                                        View runtime statistics about the bot                                        |       Admins       |

## Requirements and Setup

### System

A `Dockerfile` is provided in the repository is you wish to use Docker, otherwise:

_**`*`-prefixed variable names are available to changed via the `!config` admin command**_

- Node.js 10.8.0 or higher
- `.env` file at the root project level with the following variables set
  - `BOT_ID`: _client ID of the bot received in the developer portal_
  - `BOT_SECRET`: _client secret of the bot received in the developer portal_
  - `BOT_TOKEN`: _client token of the bot received in the developer portal_
  - `BOT_PERMISSIONS`: _integer value of the sum of the bot's permissions_
  - `DISCORD_SERVER_ID`: _ID of the server being deployed to_
  - `DISCORD_LOG_CHANNEL`: _ID of the channel designated for bot audit logs_
  - `DISCORD_MAIN_CHANNEL`: _ID of the main channel in the server_
  - `DISCORD_LFG_CHANNEL`: _ID of the channel to post looking for group notifications to_
  - `DISCORD_REGULARS_CHANNEL`: _ID of the channel designated for Regulars discussion_
  - `DISCORD_ARMA_CHANNEL`: _ID of the channel designated for ArmA 3_
  - `DISCORD_BMS_CHANNEL`: _ID of the channel designated for BMS_
  - `DISCORD_ALLOWED_GROUPS`: _comma deliminated list of groups/roles user's are allowed to join_
  - \*`DISCORD_ARMA_PLAYER_ROLE`: _the role designated for Arma 3 players_
  - \*`DISCORD_BMS_PLAYER_ROLE`: _the role designated for BMS players_
  - `ALERT_TIMES`: _comma deliminated list of "time untils" to post reminder notifications for calendar events. Hold the format of `<amt> <time_type>` (7 days, 12 hours)_
  - \*`NUM_PLAYERS_FOR_ALERT`: _the minimum player count on the server to initial an alert_
  - `HOURS_TO_REFRESH_CALENDAR`: _number of hours between updating the event list from the RSS feed for the calendar_
  - `ADMIN_ROLES`: _roles permitted to run the admin only commands for the bot_
  - `FTP_HOST`: _address of the primary mission file FTP server_
  - `FTP_USER`: _user account name to log into the FTP server_
  - `FTP_PASS`: _password for the FTP server user account_

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
