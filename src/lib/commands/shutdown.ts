import { Message } from 'discord.js'

/**
 * Shuts down the bot application until restarted manually
 * @export
 * @async
 * @param {Discord.Message} msg
 * @param {string[]} _args
 * @returns {Promise<string>}
 */
export async function shutdown(msg: Message, _args: string[]): Promise<string> {
  // Actual process termination is delayed until after logging
  // See Bot._onMessage
  await msg.author.send(`You shutdown me down!`)
  return 'shutdown successful'
}
