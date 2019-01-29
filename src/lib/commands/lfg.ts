import { Message, Guild, TextChannel } from 'discord.js'
import { GroupStore, Group, GroupType } from '../state'
import { groupsMessage, groupCreatedMessage, groupFullMessage } from '../messages'

/**
 * Looking for group command handler for finding players for a game session
 * @export
 * @async
 * @param {Discord.Guild} guild
 * @param {Discord.Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function lfg(guild: Guild, msg: Message, args: string[]): Promise<string> {
  // List current groups if no argument given or 'list' argument
  if (args.length === 0 || (args.length === 1 && args[0] === 'list')) {
    return await lfgList(msg)
  } else if (args.length === 2 && args[0] === 'join' && !isNaN(parseInt(args[1]))) {
    // Attempt to join a group if the appropriate arguments are passed
    return await lfgJoin(msg, args)
  } else if (args.length === 2 && args[0] === 'delete' && !isNaN(parseInt(args[1]))) {
    // Delete the argued group if you are the owner of it
    return await lfgDelete(msg, args)
  } else if (args.length === 3 && args[0] === 'create' && !isNaN(parseInt(args[1]))) {
    // Create a new group with the appropriately argued values
    return await lfgCreate(guild, msg, args)
  } else {
    // Invalid inputs
    await msg.author.send('Invalid arguments for the `!lfg` command given.')
    return 'INVALID_ARGS'
  }
}

/**
 * Handler for listing subcommand
 * @async
 * @param {Discord.Message} msg
 * @returns {Promise<string>}
 */
async function lfgList(msg: Message): Promise<string> {
  const groups: Group[] = GroupStore.getGroups()
  await msg.author.send({ embed: groupsMessage(groups) })
  return 'GROUP_LISTING_OUTPUT'
}

/**
 * Handler for the group join subcommand
 * @async
 * @param {Discord.Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
async function lfgJoin(msg: Message, args: string[]): Promise<string> {
  let output: string = 'INVALID_ARGS'
  const res = GroupStore.joinGroup(msg.author, parseInt(args[1]))

  if (res.group) {
    // Alert the command sender and group owner of the newly joined member
    output = `GROUP_JOIN: ${args[1]}`
    await msg.author.send(`You have joined the group **${res.group.name}**.`)
    await res.group.owner.send(
      `_**${msg.author.username}**_ has joined your group **${res.group.name}**.`
    )

    // Send the full group alert message to all members of the group and owner
    // and delete the group from the LFG storage
    if (res.full) {
      ;[res.group!.owner, ...res.group!.found].forEach(async u => {
        await u.send({ embed: groupFullMessage(res.group!) })
      })

      GroupStore.remove(res.group.id, GroupType.LFG)
    }
  } else if (!res.group) {
    // If no group was found with the argued ID
    output = `GROUP_NOT_FOUND`
    await msg.author.send(
      `No group with the ID of ${
        args[1]
      } was found. Run the \`!lfg list\` command to see the active groups.`
    )
  }

  return output
}

/**
 * Handler for the group delete subcommand
 * @async
 * @param {Discord.Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
async function lfgDelete(msg: Message, args: string[]): Promise<string> {
  let output: string = 'INVALID_ARGS'
  const target: Group[] = GroupStore.getGroups().filter(g => g.id === parseInt(args[1]))

  if (target.length === 0) {
    output = 'NO_GROUP_TO_DELETE'
    await msg.author.send(`No group with the ID of ${args[1]} exists.`)
  } else if (target[0].owner === msg.author) {
    GroupStore.remove(parseInt(args[1]), GroupType.LFG)
    output = `GROUP_REMOVE: ${args[1]}`
    await msg.author.send(`Successfully deleted your group **${target[0].name}**.`)
  } else {
    output = 'DO_NOT_OWN_GROUP'
    await msg.author.send(`You cannot delete a group that you don't own.`)
  }

  return output
}

/**
 * Handler for the group create subcommand
 * @async
 * @param {Discord.Guild} guild
 * @param {Discord.Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
async function lfgCreate(guild: Guild, msg: Message, args: string[]): Promise<string> {
  const groups: Group[] = GroupStore.getGroups()

  // First check if they already have an active LFG group, allow 1 active per user
  if (GroupStore.userAlreadyLooking(msg.author.username, groups)) {
    await msg.author.send('You already have an active LFG group!')
    return 'TOO_MANY_GROUPS'
  }

  // Parse input arguments and add newly created group
  const g: Group = {
    id: groups.length + 1,
    owner: msg.author,
    name: args[2],
    needed: parseInt(args[1]),
    found: []
  }

  GroupStore.add(g, GroupType.LFG)
  await msg.author.send(
    `You have created the new group **${
      args[2]
    }**! You will be alerted when new players join your group and when it is full.`
  )

  // Send creation announcement to main Discord channel
  const ch: TextChannel = guild.channels.find(
    c => c.id === process.env.DISCORD_LFG_CHANNEL!
  ) as TextChannel
  await ch.send({ embed: groupCreatedMessage(g) })

  return `GROUP_CREATED: ${args[2]}`
}
