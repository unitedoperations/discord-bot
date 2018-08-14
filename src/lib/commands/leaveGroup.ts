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
  let output: string

  // Check if a group name was provided as an argument
  if (args.length === 0) {
    output = "you didn't provide a group to leave"
    await msg.author.send(output)
    return output
  } else if (msg.mentions.roles.size === 0) {
    // If they don't use an @ mention for the group
    output = 'you must use an `@` mention for the group you wish to leave'
    await msg.author.send(output)
    return output
  }

  // Get group name from arguments and check if the role exists
  const group = args[0]
  const id = /<@&(\d+)>/g.exec(group)
  const role = msg.guild.roles.find(r => r.id === id![1])

  if (!role) {
    // If no role with the argued name exists end with that message
    output = `the group '${group}' does not exist`
    await msg.author.send(output)
  } else if (!msg.member.roles.find(r => r.id === role.id)) {
    // If the user doesn't below to the group argued
    output = `you are not in the '${role.name}' group`
    await msg.author.send(output)
  } else {
    // If the role exists and the user has it, remove them
    output = `successfully removed from group '${role.name}'`
    await msg.member.removeRole(role, 'Requested through bot command').catch(signale.error)
    await msg.author.send(output)
  }
  return output
}
