import signale from 'signale'
import { Message } from 'discord.js'
import { serverMessage, scrapeServerPage } from './messages'

// Constant array of allow Discord server groups for people to join
const allowedDiscordGroups: string[] = process.env.DISCORD_ALLOWED_GROUPS!.split(',')

// Array of roles allowed to run the shutdown command
const shutdownGroups: string[] = process.env.SHUTDOWN_ROLES!.split(',')

/**
 * Returns the usage information for the list of commands
 * @export
 * @async
 * @param {Message} msg
 * @param {string[]} _
 * @returns {Promise<string>}
 */
export async function help(msg: Message, _: string[]): Promise<string> {
  const output = `
  **Commands**
  \`!?\`, \`!help\`: _help for usage on commands_
  \`!join_group <group>\`: _join the argued group if it exists and have permission_
  \`!leave_group <group>\`: _leave the argued group if it exists and you are in it_
  \`!primary\`: _get the information about the current missino on the A3 primary_
  \`!ratio <total> <a> <b>\`: _calculate the player ratio for teams with A:B_
  \`!shutdown\`: _turns off the Discord bot with the correct permissions_
  `
  await msg.author.send(output)
  return 'HELP_OUTPUT'
}

/**
 * Calculate the player ratio for teams with A:B
 * @export
 * @async
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

/**
 * Get the data about the current mission on the A3 primary server
 * @export
 * @async
 * @param {Message} msg
 * @param {string[]} _
 * @returns {Promise<string>}
 */
export async function primary(msg: Message, _: string[]): Promise<string> {
  try {
    let serverInfo = await scrapeServerPage('http://www.unitedoperations.net/tools/uosim/')
    if (!serverInfo) {
      serverInfo = {
        mission: 'None',
        description: 'Unknown',
        players: '0/64',
        island: 'Unknown',
        author: 'Unknown'
      }
    }

    await msg.author.send({ embed: serverMessage(serverInfo) })
    return 'SERVER_OUTPUT'
  } catch (e) {
    // If there was an error in any asynchronous operation
    const output = 'Could not retrieve primary server data right now'
    await msg.author.send(output)
    return output
  }
}

/**
 * Shuts down the bot application until restarted manually
 * @export
 * @async
 * @param {Discord.Message} msg
 * @param {string[]} _
 * @returns {Promise<string>}
 */
export async function shutdown(msg: Message, _: string[]): Promise<string> {
  // Check if the calling user has permission to shutdown
  for (const g of shutdownGroups) {
    if (msg.member.roles.find(r => r.name === g) !== null) {
      await msg.author.send(`You shutdown me down!`)
      return 'shutdown successful'
    }
  }

  await msg.author.send(`you don't have permission to shut me down!`)
  return `invalid permissions`
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
