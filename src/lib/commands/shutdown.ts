import { Message } from 'discord.js'
import { adminGroups } from '../helpers'

/**
 * Shuts down the bot application until restarted manually
 * @export
 * @async
 * @param {Discord.Message} msg
 * @param {string[]} _args
 * @returns {Promise<string>}
 */
export async function shutdown(msg: Message, _args: string[]): Promise<string> {
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
