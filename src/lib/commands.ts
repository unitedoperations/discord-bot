import signale from 'signale'
import { Message } from 'discord.js'
import { Bot } from '../bot'
import { serverMessage, pollsMessage } from './messages'
import { scrapeServerPage, scrapeThreadsPage } from './helpers'

// Constant array of allow Discord server groups for people to join
const allowedDiscordGroups: string[] = process.env.DISCORD_ALLOWED_GROUPS!.split(',')

// Array of roles allowed to run the admin only commands
const adminGroups: string[] = process.env.ADMIN_ROLES!.split(',')

/**
 * Returns the usage information for the list of commands
 * @export
 * @async
 * @param {Bot} _ctx
 * @param {Message} msg
 * @param {string[]} _args
 * @returns {Promise<string>}
 */
export async function help(_ctx: Bot, msg: Message, _args: string[]): Promise<string> {
  const output = `
  **Commands**
  \`!?\`, \`!help\`: _help for usage on commands_
  \`!config <key> <value>\`: _**(admin only)** re-configure available bot options; check GitHub for list of options_
  \`!join_group <group>\`: _join the argued group if it exists and have permission_
  \`!leave_group <group>\`: _leave the argued group if it exists and you are in it_
  \`!polls\`: _get a list of the active polls/voting threads on the forums_
  \`!primary\`: _get the information about the current mission on the A3 primary_
  \`!ratio <total> <a> <b>\`: _calculate the player ratio for teams with A:B_
  \`!shutdown\`: _**(admin only)** turns off the Discord bot with the correct permissions_
  ---------------------------------------------------------------------------------
  _**All bug reports and feature requests should be submitted through the \`Issues\` system on the GitHub repository:**_
  https://github.com/unitedoperations/uo-discordbot
  `
  await msg.author.send(output)
  return 'HELP_OUTPUT'
}

/**
 * Pulls and returns a list of open voting threads from the forums
 * @export
 * @async
 * @param {Bot} _ctx
 * @param {Message} msg
 * @param {string[]} _args
 * @returns {Promise<string>}
 */
export async function polls(_ctx: Bot, msg: Message, _args: string[]): Promise<string> {
  try {
    let openThreads = await scrapeThreadsPage(
      'http://forums.unitedoperations.net/index.php/forum/132-policy-voting-discussions/'
    )

    // Check if any open polls exist
    if (openThreads.length === 0) {
      const output = 'There are currently no open polls'
      await msg.author.send(output)
      return output
    }

    await msg.author.send({ embed: pollsMessage(openThreads, 'open') })
    return 'VOTING_THREADS_OUTPUT'
  } catch (e) {
    // If there was an error in any asynchronous operation
    const output = 'Could not retrieve voting thread data right now'
    await msg.author.send(output)
    return output
  }
}

/**
 * Calculate the player ratio for teams with A:B
 * @export
 * @async
 * @param {Bot} _ctx
 * @param {Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function ratio(_ctx: Bot, msg: Message, args: string[]): Promise<string> {
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
 * Allows admin role users to alter some configuration options for the bot
 * @export
 * @async
 * @param {Bot} _ctx
 * @param {Discord.Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function config(_ctx: Bot, msg: Message, args: string[]): Promise<string> {
  let output: string
  const reqArgs = 2

  // Check for correct amount of arguments passed
  if (args.length !== reqArgs) {
    output = `got ${args.length} inputs instead of ${reqArgs}`
    await msg.author.send(output)
    return output
  }

  // Check if the user has the correct role permissions
  for (const g of adminGroups) {
    if (msg.member.roles.find(r => r.name === g) !== null) {
      // Parse inputs and check for validity
      const [key, value] = args
      switch (key) {
        case 'DISCORD_ARMA_PLAYER_ROLE':
          Bot.ARMA_PLAYER_ROLE = value
          break
        case 'DISCORD_BMS_PLAYER_ROLE':
          Bot.BMS_PLAYER_ROLE = value
          break
        case 'NUM_PLAYERS_FOR_ALERT':
          Bot.NUM_PLAYERS_FOR_ALERT = parseInt(value)
          break
        default:
          output = `${key} is an invalid configuration key`
          await msg.author.send(output)
          return output
      }

      output = `you successfully set ${key} to ${value}`
      await msg.author.send(output)
      return output
    }
  }

  await msg.author.send(`you don't have permission to edit my configuration!`)
  return `invalid permissions`
}

/**
 * Get the data about the current mission on the A3 primary server
 * @export
 * @async
 * @param {Bot} _ctx
 * @param {Message} msg
 * @param {string[]} _args
 * @returns {Promise<string>}
 */
export async function primary(_ctx: Bot, msg: Message, _args: string[]): Promise<string> {
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
 * @param {Bot} _ctx
 * @param {Discord.Message} msg
 * @param {string[]} _args
 * @returns {Promise<string>}
 */
export async function shutdown(_ctx: Bot, msg: Message, _args: string[]): Promise<string> {
  // Check if the calling user has permission to shutdown
  for (const g of adminGroups) {
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
 * @param {Bot} _ctx
 * @param {Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function joinGroup(_ctx: Bot, msg: Message, args: string[]): Promise<string> {
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
 * @param {Bot} _ctx
 * @param {Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function leaveGroup(_ctx: Bot, msg: Message, args: string[]): Promise<string> {
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
