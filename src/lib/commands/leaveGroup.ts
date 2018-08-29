import { Message } from 'discord.js'
import signale from 'signale'

/**
 * Allows a user to leave a group that they are currently in
 * @export
 * @async
 * @param {Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function leaveGroup(msg: Message, args: string[]): Promise<string> {
  // Check if a group name was provided as an argument
  if (args.length === 0) {
    await msg.author.send("You didn't provide a group to leave.")
    return 'INVALID_ARGS'
  } else if (msg.mentions.roles.size === 0) {
    // If they don't use an @ mention for the group
    await msg.author.send('You must use an `@` mention for the group you wish to leave.')
    return 'INVALID_ARGS'
  }

  // Get group name from arguments and check if the role exists
  const group = args[0]
  const id = /<@&(\d+)>/g.exec(group)
  const role = msg.guild.roles.find(r => r.id === id![1])

  if (!role) {
    // If no role with the argued name exists end with that message
    await msg.author.send(`The group '${group}' does not exist.`)
    return 'GROUP_DOES_NOT_EXIST'
  } else if (!msg.member.roles.find(r => r.id === role.id)) {
    // If the user doesn't below to the group argued
    await msg.author.send(`You are not in the '${role.name}' group.`)
    return `NOT_A_MEMBER: ${role.name}`
  } else {
    // If the role exists and the user has it, remove them
    await msg.member.removeRole(role, 'Requested through bot command').catch(signale.error)
    await msg.author.send(`Successfully removed from group '${role.name}'.`)
    return `REMOVED_FROM_GROUP: ${role.name}`
  }
}
