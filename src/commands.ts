import signale from 'signale'
import { Message } from 'discord.js'

/**
 * Allows a user to join a group that is within their permissions
 * @export
 * @param {Message} msg
 * @param {...string[]} args
 * @returns {string}
 */
export function joinGroup(msg: Message, ...args: string[]): string {
  let output: string
  if (args.length === 0) {
    output = "you didn't provide a group to join"
    msg.channel.send(`<@${msg.author.id}> ${output}`)
    return output
  }

  const groupName = args[0]
  const role = msg.guild.roles.find('name', groupName)
  if (!role) {
    output = `the group '${groupName}' does not exist`
    msg.channel.send(`<@${msg.author.id}> ${output}`)
  } else {
    output = `Successfully added to group ${groupName}`
    msg.member.addRole(role, 'Requested through bot command').catch(signale.error)
  }

  return output
}

/**
 * Allows a user to leave a group that they are currently in
 * @export
 * @param {Message} msg
 * @param {...string[]} args
 * @returns {string}
 */
export function leaveGroup(msg: Message, ...args: string[]): string {
  let output: string
  if (args.length === 0) {
    output = "you didn't provide a group to leave"
    msg.channel.send(`<@${msg.author.id}> ${output}`)
    return output
  }

  const groupName = args[0]
  const role = msg.guild.roles.find('name', groupName)
  if (!role) {
    output = `the group '${groupName}' does not exist`
    msg.channel.send(`<@${msg.author.id}> ${output}`)
  } else if (msg.member.roles.find('name', groupName) === null) {
    output = `you are not in the '${groupName} group`
    msg.channel.send(`<@${msg.author.id}> ${output}`)
  } else {
    output = `Successfully removed from group ${groupName}`
    msg.member.removeRole(role, 'Requested through bot command').catch(signale.error)
  }

  return output
}
