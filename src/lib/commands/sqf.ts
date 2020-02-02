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

/**
 * Searches the BIS developer wiki for information about the
 * argued SQF command and gives the sender details on usage
 * @export
 * @async
 * @param {Guild} _guild
 * @param {Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function sqf(_guild: Guild, msg: Message, args: string[]): Promise<string> {
  // Check for required argument
  if (args.length !== 1) {
    await msg.author.send('This command requires 1 argued which is the name of the SQF command.')
    return 'INVALID_ARGS'
  }

  // Send the URL to the author for the command
  const url: string = `https://community.bistudio.com/wiki/${args[0]}`
  await msg.author.send(url)

  return `SQF_CMD: ${args[0]}`
}

/**
 * Searches the BIS developer wiki for information about the
 * argued SQF command and gives the sender details on usage
 * put posts the result publicly in the channel instead of in
 * private message to the author
 * @export
 * @async
 * @param {Guild} _guild
 * @param {Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function sqfp(_guild: Guild, msg: Message, args: string[]): Promise<string> {
  // Check for required argument
  if (args.length !== 1) {
    await msg.author.send('This command requires 1 argued which is the name of the SQF command.')
    return 'INVALID_ARGS'
  }

  // Send the URL to the author for the command
  const url: string = `https://community.bistudio.com/wiki/${args[0]}`
  await msg.channel.send(url)

  return `SQF_CMD: ${args[0]}`
}
