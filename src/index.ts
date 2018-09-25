require('dotenv').config()
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { Bot } from './bot'
import * as cmd from './lib/commands'
import { admins, deprecated } from './lib/access'

// Create new Bot instance and start
const version: Buffer = readFileSync(resolve(__dirname, '..', 'VERSION'))
const bot = new Bot(version.toString().trimRight())
bot
  .addCommand('about', '`!about`: _display information about the bot_', cmd.about)
  .addCommand(
    'alerts',
    '`!alerts`: _display the pending alerts that are scheduled in the bot_',
    cmd.alerts,
    admins
  )
  .addCommand(
    'config',
    '`!config <key> <value>`: _re-configure available bot options; check GitHub for list of options_',
    cmd.config,
    admins
  )
  .addCommand('events', '`!events`: _displays all pending community events_', cmd.events)
  .addCommand(
    'join_group',
    '`!join_group <group>`: _join the argued group if it exists and have permission_',
    cmd.joinGroup
  )
  .addCommand(
    'leave_group',
    '`!leave_group <group>`: _leave the argued group if it exists and you are in it_',
    cmd.leaveGroup
  )
  .addCommand(
    'lfg',
    '`!lfg list | create <# needed> <name> | join <id> | delete <id>`: _looking for group functionality to find people to play a game with_',
    cmd.lfg
  )
  .addCommand(
    'missions',
    '`!missions <name>`: _search for mission on the FTP server with names that fully or partially match the argued name_',
    cmd.missions
  )
  // DEPRECATED:
  .addCommand(
    'polls',
    '`!polls`: _get a list of the active polls/voting threads on the forums_',
    cmd.polls,
    deprecated
  )
  .addCommand(
    'primary',
    '`!primary`: _get the information about the current mission on the A3 primary_',
    cmd.primary
  )
  .addCommand(
    'ratio',
    '`!ratio <total> <a> <b>`: _calculate the player ratio for teams with A:B_',
    cmd.ratio
  )
  .addCommand(
    'ready',
    '`!ready <#>`: _receive an alert from the bot when the primary server reaches a certain player count_',
    cmd.ready
  )
  .addCommand(
    'shutdown',
    '`!shutdown`: _turns off the Discord bot with the correct permissions_',
    cmd.shutdown,
    admins
  )
  .addCommand(
    'sqf',
    '`!sqf <command>`: _search the BIS wiki for information about an SQF command_',
    cmd.sqf
  )
  .compileCommands()
  .start(process.env.BOT_TOKEN!)
