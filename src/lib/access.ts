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
import { Env } from './state'
import { BotAction } from '../bot'

const permissionsError: string = 'invalid user permissions'

/**
 * Custom type for casting a function to an access modifier for commands
 * @export
 */
export type CommandProvision = (fn: BotAction) => BotAction

/**
 * Role permission wrappers for bot action functions using
 * the `permissioned` currying function
 * @exports
 */
export const admins: CommandProvision = permissioned(Env.ADMIN_ROLES)
Object.defineProperty(admins, 'name', {
  value: 'admins'
})

export const regulars: CommandProvision = permissioned(['Regulars', ...Env.ADMIN_ROLES])
Object.defineProperty(regulars, 'name', {
  value: 'regulars'
})

/**
 * Currying function to assign groups into different permissioned
 * controller for BotAction functions
 * @param {string[]} group
 * @returns {(BotAction) => BotAction}
 */
function permissioned(group: string[]): (fn: BotAction) => BotAction {
  return (fn: BotAction): BotAction => {
    return async (guild: Guild, msg: Message, args: string[]): Promise<string> => {
      // Check if the calling user has permission to call command
      for (const g of group) {
        if (guild.member(msg.author).roles.find(r => r.name === g) !== null) {
          return await fn(guild, msg, args)
        }
      }

      // If they don't have admin permissions
      await msg.author.send(`You don't have permission to run this command!`)
      return permissionsError
    }
  }
}

/**
 * Function decorator to deprecate a command temporarily or mark
 * as broken during production
 * @export
 * @param {BotAction} cmd
 * @returns {BotAction}
 */
export function disabled(cmd: BotAction): BotAction {
  return async (_guild: Guild, msg: Message, _args: string[]): Promise<string> => {
    const output: string = `The \`${cmd.name}\` command is currently broken or temporaryily disabled. Please contact the developers or post a GitHub issue at the link found by running \`!?\`.`
    await msg.author.send(output)
    return output
  }
}
