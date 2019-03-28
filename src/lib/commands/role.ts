import { Message, Guild } from 'discord.js'
import * as log from '../logger'
import { Env } from '../state'

/**
 * Allows a user to join a group that is within their permissions
 * @export
 * @async
 * @param {Discord.Guild} guild
 * @param {Discord.Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function role(guild: Guild, msg: Message, args: string[]): Promise<string> {
  // Check if a group name was provided as an argument
  if (args.length === 0) {
    await msg.author.send("You didn't provide an action or group.")
    return 'INVALID_ARGS'
  }

  const action: string = args[0]
  if (action !== 'add' && action !== 'remove') {
    await msg.author.send('The action must be either `add` or `remove` for the first argument.')
  }

  // Get group name from arguments and check if the role exists in the guild
  const name = args[1].replace(/_/g, ' ')
  const role = guild.roles.find(r => r.name === name)

  if (!role) {
    // If no role with the argued name exists end with that message
    await msg.author.send(`The group '${name}' does not exist.`)
    return 'GROUP_DOES_NOT_EXIST'
  } else if (!Env.ALLOWED_GROUPS.includes(role.name)) {
    // If the argued group name is not included in the permitted groups
    await msg.author.send(`You don't have permission to join '${role.name}'.`)
    return 'INVALID_PERMISSIONS'
  } else {
    if (action === 'add') {
      await guild
        .member(msg.author)
        .addRole(role, 'Requested through bot command')
        .catch(log.error)
      await msg.author.send(`Successfully added role '${role.name}'.`)
      return `ADDED_ROLE: ${role.name}`
    } else {
      await guild
        .member(msg.author)
        .removeRole(role, 'Requested through bot command')
        .catch(log.error)
      await msg.author.send(`Successfully removed role '${role.name}'.`)
      return `REMOVED_ROLE: ${role.name}`
    }
  }
}
