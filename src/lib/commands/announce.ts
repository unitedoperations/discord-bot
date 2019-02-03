import { Message, Guild, TextChannel } from 'discord.js'
import { EnvStore } from '../state'
import { updateMessage } from '../messages'
import { Bot } from '../../bot'

/**
 * Sends a description of the pending alerts that are scheduled
 * @export
 * @async
 * @param {Discord.Guild} guild
 * @param {Discord.Message} _msg
 * @param {string[]} _args
 * @returns {Promise<string>}
 */
export async function announce(guild: Guild, _msg: Message, _args: string[]): Promise<string> {
  // Send new bot upgrade message to general chat
  const chan = guild.channels.find(c => c.id === EnvStore.MAIN_CHANNEL) as TextChannel
  chan.send({ embed: updateMessage(Bot.VERSION) })
  return 'BOT_UPGRADE'
}
