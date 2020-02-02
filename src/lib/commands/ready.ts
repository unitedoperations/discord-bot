/*
 * Copyright (C) 2020  United Operations
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

import { Message, Guild } from 'discord.js'
import { Alarms } from '../state'

/**
 * Register for an alert when the server hits a certain player count
 * @export
 * @async
 * @param {Guild} _guild
 * @param {Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function ready(_guild: Guild, msg: Message, args: string[]): Promise<string> {
  if (args.length !== 1) {
    await msg.author.send('The command takes the player count required for the server to trigger your alarm.')
    return 'INVALID_ARGS'
  }

  if (args[0] === 'count') {
    const count: number = Alarms.numberOfAlarms()
    await msg.author.send(`There are ${count} players waiting for player count alerts.`)
    return 'READY_ALARMS_COUNT'
  }

  try {
    const num: number = parseInt(args[0])
    const alreadyRegistered: boolean = Alarms.register(num, msg.author)

    if (alreadyRegistered) {
      await msg.author.send(
        `Your previous alarm has been overridden and you will be alerted when the primary server reaches or exceeds **${num}** players.`
      )
    } else {
      await msg.author.send(`You will be alerted when the primary server reaches or exceeds **${num}** players.`)
    }

    return 'READY_ALARM_OUTPUT'
  } catch (e) {
    await msg.author.send('The parameter for this command must be a number.')
    return 'INVALID_ARGS'
  }
}
