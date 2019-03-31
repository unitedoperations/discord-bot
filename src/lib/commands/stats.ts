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

import { Message, Guild } from 'discord.js'
import { Bot } from '../../bot'
import { statsMessage } from '../messages'
import { Events, Alarms, Groups } from '../state'

/**
 * View runtime statistics collected and stored by the chatbot
 * @export
 * @async
 * @param {Discord.Guild} _guild
 * @param {Discord.Message} msg
 * @param {string[]} _args
 * @returns {Promise<string>}
 */
export async function stats(_guild: Guild, msg: Message, _args: string[]): Promise<string> {
  await msg.author.send({
    embed: statsMessage(
      formatUptime(process.uptime()),
      Bot.REQUEST_COUNT,
      Bot.NEW_MEMBER_MESSAGES_SENT,
      Events.getEvents().length,
      Alarms.numberOfAlarms(),
      Groups.getGroups().length
    )
  })
  return 'RUNTIME_STATS'
}

/**
 * Formats the application uptime from seconds to hour, minutes and seconds
 * @param {number} seconds
 * @returns {string}
 */
function formatUptime(uptime: number): string {
  const pad = (s: number): string => (s < 10 ? '0' : '') + s

  const hours = Math.floor(uptime / (60 * 60))
  const minutes = Math.floor((uptime % (60 * 60)) / 60)
  const seconds = Math.floor(uptime % 60)

  return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds)
}
