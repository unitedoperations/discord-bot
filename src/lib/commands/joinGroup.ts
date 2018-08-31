import { Message, Guild } from 'discord.js'
import signale from 'signale'
import { allowedDiscordGroups } from '../access'

/**
 * Allows a user to join a group that is within their permissions
 * @export
 * @async
 * @param {Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function joinGroup(msg: Message, args: string[]): Promise<string> {
  // Check if a group name was provided as an argument
  if (args.length === 0) {
    await msg.author.send("You didn't provide a group to join.")
    return 'INVALID_ARGS'
  }

  // Get group name from arguments and check if the role exists in the guild
  const name = args[0]

  let guild: Guild
  if (msg.guild) {
    guild = msg.guild
  } else {
    guild = msg.client.guilds.find(g => g.id === process.env.DISCORD_SERVER_ID!)
  }

  const role = guild.roles.find(r => r.name === name)

  if (!role) {
    // If no role with the argued name exists end with that message
    await msg.author.send(`The group '${name}' does not exist.`)
    return 'GROUP_DOES_NOT_EXIST'
  } else if (!allowedDiscordGroups.includes(role.name)) {
    // If the argued group name is not included in the permitted groups
    await msg.author.send(`You don't have permission to join '${role.name}'.`)
    return 'INVALID_PERMISSIONS'
  } else {
    // If it exists and is permitted for joining, add the user
    await msg.member.addRole(role, 'Requested through bot command').catch(signale.error)
    await msg.author.send(`Successfully added to group '${role.name}'.`)
    return `ADDED_TO_GROUP: ${role.name}`
  }
}
