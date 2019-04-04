/*
 * Copyright (C) 2019  United Operations
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

require('dotenv').config()
import { Bot } from './bot'
import * as server from './grpc'
import * as cmd from './lib/commands'
import { Env } from './lib/state'
import { admins, regulars, disabled } from './lib/access'
import { fav, error } from './lib/logger'

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
    'lfg',
    '`!lfg list | create <# needed> <name> | join <id> | delete <id>`: _looking for group functionality to find people to play a game with_',
    cmd.lfg
  )
  .addCommand(
    'missions',
    '`!missions <name>`: _search for mission on the forums API with names that fully or partially match the argued name_',
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
    disabled
  )
  .addCommand(
    'ratio',
    '`!ratio <total> <a> <b>`: _calculate the player ratio for teams with A:B_',
    cmd.ratio
  )
  .addCommand(
    'ready',
    '`!ready <#> | count`: _receive an alert from the bot when the primary server reaches a certain player count or see how many users are waiting for alerts_',
    cmd.ready,
    disabled
  )
  .addCommand(
    'role',
    '`!role add | remove <group>`: _assign or remove a Discord role if it exists and is in the permitted list_',
    cmd.role
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
  .addCommand(
    'user',
    '`!user <username>`: _view authentication information for a given user_',
    cmd.user,
    admins
  )
  .start(Env.BOT_TOKEN)
  .then(() => {
    server.init(bot).start()
    fav(`gRPC server running on :${process.env.GRPC_PORT!}`)
  })
  .catch(err => error(`START: ${err}`))
