require('dotenv').config()
import { Bot } from './bot'
import * as cmd from './lib/commands'
import { Env } from './lib/state'
import { admins, regulars, deprecated } from './lib/access'
import { error } from './lib/logger'

process.on('unhandledRejection', (reason: any, _promise: Promise<any>) => {
  error(`Unhandled Rejection ${reason.stack || reason}`)
})

const { version } = require('../package.json')
const bot = new Bot(version)
bot
  .addCommand('about', '`!about`: _display information about the bot_', cmd.about)
  .addCommand(
    'alerts',
    '`!alerts`: _display the pending alerts that are scheduled in the bot_',
    cmd.alerts,
    admins
  )
  .addCommand(
    'announce',
    '`!announce`: _send update message to general channel for the bot_',
    cmd.announce,
    admins
  )
  .addCommand('events', '`!events`: _displays all pending community events_', cmd.events)
  .addCommand(
    'flight',
    '`!flight list | create <SIM> <HH:MM> <MM/DD> <details> | join <id> | delete <id>`: _manage pickup flights for UOAF_',
    cmd.flight
  )
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
  .addCommand(
    'polls',
    '`!polls`: _get a list of the active polls/voting threads on the forums_',
    cmd.polls,
    regulars
  )
  .addCommand(
    'primary',
    '`!primary`: _get the information about the current mission on the A3 primary_',
    cmd.primary,
    deprecated
  )
  .addCommand(
    'ratio',
    '`!ratio <total> <a> <b>`: _calculate the player ratio for teams with A:B_',
    cmd.ratio
  )
  .addCommand(
    'ready',
    '`!ready <#> | count`: _receive an alert from the bot when the primary server reaches a certain player count or see how many users are waiting for alerts_',
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
  .addCommand(
    'sqfp',
    '`!sqfp <command>`: _search BIS wiki for information about an SQF command and post the result publicly_',
    cmd.sqfp
  )
  .addCommand('stats', '`!stats`: _view runtime statistics about the bot_', cmd.stats, admins)
  .start(Env.BOT_TOKEN)
  .catch(err => error(`START: ${err}`))
