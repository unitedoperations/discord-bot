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

import { Message, Guild, TextChannel } from 'discord.js'
import { Env } from '../state'
import { updateMessage } from '../messages'
import { Bot } from '../../bot'

/**
 * Sends a description of the pending alerts that are scheduled
 * @export
 * @async
 * @param {Discord.Guild} guild
 * @param {Discord.Message} _msg
 * @param {string[]} _args
 * @returns {Promise<string>}
 */
export async function announce(guild: Guild, _msg: Message, _args: string[]): Promise<string> {
  // Send new bot upgrade message to general chat
  const chan = guild.channels.find(c => c.id === Env.MAIN_CHANNEL) as TextChannel
  chan.send({ embed: updateMessage(Bot.VERSION) })
  return 'BOT_UPGRADE'
}
