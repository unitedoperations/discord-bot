import { Message, Guild } from 'discord.js'
import { aboutMessage } from '../messages'

/**
 * Sends the user the logistically information about the bot
 * @export
 * @async
 * @param {Discord.Guild} _guild
 * @param {Discord.Message} msg
 * @param {string[]} _args
 * @returns {Promise<string>}
 */
export async function about(_guild: Guild, msg: Message, _args: string[]): Promise<string> {
  await msg.author.send({ embed: aboutMessage() })
  return 'ABOUT_INFO'
}
