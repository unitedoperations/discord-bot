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
import { BotAction } from '../../bot'
import { helpMessage } from '../messages'

/**
 * Returns the usage information for the list of commands
 * @export
 * @async
 * @param {Map<string, string>} output
 * @returns {BotAction}
 */
export function help(commands: Map<string, string>): BotAction {
  return async (_guild: Guild, msg: Message, _args: string[]): Promise<string> => {
    await msg.author.send({ embed: helpMessage(commands) })
    return 'HELP_OUTPUT'
  }
}
