import signale from 'signale'
import { Message } from 'discord.js'

const PERMITTED_GROUPS: string[] = process.env.PERMITTED_GROUPS!.split(',')

export async function help(msg: Message, args: string[]): Promise<string> {
  const output = `
  **Commands**
  \`!?\`, \`!help\`: _help for usage on commands_
  \`!ratio <total> <a> <b>\`: _calculate the player ratio for teams with A:B_
  \`!join_group <group>\`: _join the argued group if it exists and have permission_
  \`!leave_group <group>\`: _leave the argued group if it exists and you are in it_
  `
  await msg.author.send(output)
  return 'HELP_OUTPUT'
}

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
  }

  // Get group name from arguments and check if the role exists
  const groupName = args[0]
  const role = msg.guild.roles.find('name', groupName)

  if (!role) {
    // If no role with the argued name exists end with that message
    output = `the group '${groupName}' does not exist`
    await msg.author.send(output)
  } else if (!PERMITTED_GROUPS.includes(groupName)) {
    // If the argued group name is not included in the permitted groups
    output = `you don't have permission to join '${groupName}'`
    await msg.author.send(output)
  } else {
    // If it exists and is permitted for joining, add the user
    output = `successfully added to group '${groupName}'`
    await msg.member.addRole(role, 'Requested through bot command').catch(signale.error)
    await msg.author.send(output)
  }

  return output
}

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
  }

  // Get group name from arguments and check if the group exists
  const groupName = args[0]
  const role = msg.guild.roles.find('name', groupName)

  if (!role) {
    // If no role with the argued name exists end with that message
    output = `the group '${groupName}' does not exist`
    await msg.author.send(output)
  } else if (!msg.member.roles.find('name', groupName)) {
    // If the user doesn't below to the group argued
    output = `you are not in the '${groupName}' group`
    await msg.author.send(output)
  } else {
    // If the role exists and the user has it, remove them
    output = `successfully removed from group '${groupName}'`
    await msg.member.removeRole(role, 'Requested through bot command').catch(signale.error)
    await msg.author.send(output)
  }

  return output
}

/**
 * @description
 * @export
 * @param {Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function ratio(msg: Message, args: string[]): Promise<string> {
  let output: string
  const reqArgs = 3

  // Check for the arguments required
  if (args.length != reqArgs) {
    output = `got ${args.length} inputs instead of ${reqArgs}`
    await msg.author.send(output)
    return output
  }

  // Gather required values
  const [players, ratioA, ratioB] = args.map(a => parseFloat(a))

  // Calculate the ratio on each side
  const sideA = Math.round((ratioA * players) / (ratioA + ratioB))
  const sideB = players - sideA

  // Send caluclation message
  output = `Ratio for ${players} ${ratioA}:${ratioB}\nSide A: ${sideA}\nSide B: ${sideB}`
  await msg.author.send(output)

  return output.replace('\n', '')
}
