import { Message, Guild } from 'discord.js'
import { Bot } from '../../bot'

/**
 * Allows admin role users to alter some configuration options for the bot
 * @export
 * @async
 * @param {Discord.Guild} _guild
 * @param {Discord.Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function config(_guild: Guild, msg: Message, args: string[]): Promise<string> {
  const reqArgs = 2

  // Check for correct amount of arguments passed
  if (args.length !== reqArgs) {
    await msg.author.send(`Received ${args.length} inputs instead of ${reqArgs}`)
    return 'INVALID_ARGS'
  }

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
      await msg.author.send(`${key} is an invalid configuration key.`)
      return `INVALID_KEY: ${key}`
  }

  await msg.author.send(`You successfully set ${key} to ${value}.`)
  return `CONFIG_SET: ${key} - ${value}`
}
