import { Message, Guild } from 'discord.js'
import { BotAction } from '../bot'

const permissionsError: string = 'invalid user permissions'

/**
 * Custom type for casting a function to an access modifier for commands
 * @export
 */
export type CommandProvision = (fn: BotAction) => BotAction

/**
 * Constant array of allow Discord server groups for people to join
 * @export
 */
export const allowedDiscordGroups: string[] = process.env.DISCORD_ALLOWED_GROUPS!.split(',')

/**
 * Array of roles allowed to run the admin only commands
 * @export
 */
export const adminGroups: string[] = process.env.ADMIN_ROLES!.split(',')

/**
 * Role permission wrappers for bot action functions using
 * the `permissioned` currying function
 * @exports
 */
export const admins: CommandProvision = permissioned(adminGroups)
Object.defineProperty(admins, 'name', {
  value: 'admins'
})

export const regulars: CommandProvision = permissioned(['Regulars'])
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
export function deprecated(cmd: BotAction): BotAction {
  return async (_guild: Guild, msg: Message, _args: string[]): Promise<string> => {
    const output: string = `The \`${
      cmd.name
    }\` command is currently broken or deprecated. Please contact the developers or post a GitHub issue at the link found by running \`!?\`.`
    await msg.author.send(output)
    return output
  }
}
