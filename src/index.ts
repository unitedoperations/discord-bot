require('dotenv').config()
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { Bot } from './bot'
import {
  about,
  alerts,
  config,
  events,
  joinGroup,
  leaveGroup,
  lfg,
  polls,
  primary,
  ratio,
  shutdown
} from './lib/commands'
import { admins, deprecated } from './lib/access'

// Create new Bot instance and start
const version: Buffer = readFileSync(resolve(__dirname, '..', 'VERSION'))
const bot = new Bot(version.toString().trimRight())
bot
  .addCommand('about', '`!about`: _display information about the bot_', about)
  .addCommand(
    'alerts',
    '`!alerts`: _display the pending alerts that are scheduled in the bot_',
    alerts,
    admins
  )
  .addCommand(
    'config',
    '`!config <key> <value>`: _re-configure available bot options; check GitHub for list of options_',
    config,
    admins
  )
  .addCommand('events', '`!events`: _displays all pending community events_', events)
  .addCommand(
    'join_group',
    '`!join_group <group>`: _join the argued group if it exists and have permission_',
    joinGroup
  )
  .addCommand(
    'leave_group',
    '`!leave_group <group>`: _leave the argued group if it exists and you are in it_',
    leaveGroup
  )
  .addCommand(
    'lfg',
    '`!lfg list | create <# needed> <name> | join <id> | delete <id>`: _looking for group functionality to find people to play a game with_',
    lfg
  )
  // DEPRECATED:
  .addCommand(
    'polls',
    '`!polls`: _get a list of the active polls/voting threads on the forums_',
    polls,
    deprecated
  )
  .addCommand(
    'primary',
    '`!primary`: _get the information about the current mission on the A3 primary_',
    primary
  )
  .addCommand(
    'ratio',
    '`!ratio <total> <a> <b>`: _calculate the player ratio for teams with A:B_',
    ratio
  )
  .addCommand(
    'shutdown',
    '`!shutdown`: _turns off the Discord bot with the correct permissions_',
    shutdown,
    admins
  )
  .compileCommands()
  .start(process.env.BOT_TOKEN!)
