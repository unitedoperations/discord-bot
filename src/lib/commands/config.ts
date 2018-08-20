import { Message } from 'discord.js'
import { Bot } from '../../bot'

/**
 * Allows admin role users to alter some configuration options for the bot
 * @export
 * @async
 * @param {Discord.Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function config(msg: Message, args: string[]): Promise<string> {
  let output: string
  const reqArgs = 2

  // Check for correct amount of arguments passed
  if (args.length !== reqArgs) {
    output = `got ${args.length} inputs instead of ${reqArgs}`
    await msg.author.send(output)
    return output
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
      output = `${key} is an invalid configuration key`
      await msg.author.send(output)
      return output
  }

  output = `you successfully set ${key} to ${value}`
  await msg.author.send(output)
  return output
}
