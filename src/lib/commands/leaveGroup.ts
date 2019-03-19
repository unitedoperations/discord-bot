import { Message, Guild } from 'discord.js'
import * as log from '../logger'

/**
 * Allows a user to leave a group that they are currently in
 * @export
 * @async
 * @param {Discord.Guild} guild
 * @param {Discord.Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function leaveGroup(guild: Guild, msg: Message, args: string[]): Promise<string> {
  // Check if a group name was provided as an argument
  if (args.length === 0) {
    await msg.author.send("You didn't provide a group to leave.")
    return 'INVALID_ARGS'
  }

  // Get group name from arguments and check if the role exists
  const name = args[0].replace(/_/g, ' ')
  const role = guild.roles.find(r => r.name === name)

  if (!role) {
    // If no role with the argued name exists end with that message
    await msg.author.send(`The group '${name}' does not exist.`)
    return 'GROUP_DOES_NOT_EXIST'
  } else if (!guild.member(msg.author).roles.find(r => r.id === role.id)) {
    // If the user doesn't below to the group argued
    await msg.author.send(`You are not in the '${role.name}' group.`)
    return `NOT_A_MEMBER: ${role.name}`
  } else {
    // If the role exists and the user has it, remove them
    await guild
      .member(msg.author)
      .removeRole(role, 'Requested through bot command')
      .catch(log.error)
    await msg.author.send(`Successfully removed from group '${role.name}'.`)
    return `REMOVED_FROM_GROUP: ${role.name}`
  }
}
