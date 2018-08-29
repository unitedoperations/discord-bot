import { Message } from 'discord.js'
import { aboutMessage } from '../messages'

/**
 * Sends the user the logistically information about the bot
 * @export
 * @async
 * @param {Message} msg
 * @param {string[]} _
 * @returns {Promise<string>}
 */
export async function about(msg: Message, _: string[]): Promise<string> {
  await msg.author.send({ embed: aboutMessage() })
  return 'ABOUT_INFO'
}
