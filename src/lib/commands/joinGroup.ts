import { Message } from 'discord.js'
import signale from 'signale'
import { allowedDiscordGroups } from '../helpers'

/**
 * Allows a user to join a group that is within their permissions
 * @export
 * @async
 * @param {Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function joinGroup(msg: Message, args: string[]): Promise<string> {
  let output: string

  // Check if a group name was provided as an argument
  if (args.length === 0) {
    output = "you didn't provide a group to join"
    await msg.author.send(output)
    return output
  } else if (msg.mentions.roles.size === 0) {
    // If they don't use an @ mention for the group
    output = 'you must use an `@` mention for the group you wish to join'
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
  } else if (!allowedDiscordGroups.includes(role.name)) {
    // If the argued group name is not included in the permitted groups
    output = `you don't have permission to join '${role.name}'`
    await msg.author.send(output)
  } else {
    // If it exists and is permitted for joining, add the user
    output = `successfully added to group '${role.name}'`
    await msg.member.addRole(role, 'Requested through bot command').catch(signale.error)
    await msg.author.send(output)
  }
  return output
}
