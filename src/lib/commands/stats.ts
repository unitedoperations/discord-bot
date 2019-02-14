import { Message, Guild } from 'discord.js'
import { Bot } from '../../bot'
import { statsMessage } from '../messages'
import { Events, Alarms, Groups } from '../state'

/**
 * View runtime statistics collected and stored by the chatbot
 * @export
 * @async
 * @param {Discord.Guild} _guild
 * @param {Discord.Message} msg
 * @param {string[]} _args
 * @returns {Promise<string>}
 */
export async function stats(_guild: Guild, msg: Message, _args: string[]): Promise<string> {
  await msg.author.send({
    embed: statsMessage(
      formatUptime(process.uptime()),
      Bot.REQUEST_COUNT,
      Events.getEvents().length,
      Alarms.numberOfAlarms(),
      Groups.getGroups().length
    )
  })
  return 'RUNTIME_STATS'
}

/**
 * Formats the application uptime from seconds to hour, minutes and seconds
 * @param {number} seconds
 * @returns {string}
 */
function formatUptime(uptime: number): string {
  const pad = (s: number): string => (s < 10 ? '0' : '') + s

  const hours = Math.floor(uptime / (60 * 60))
  const minutes = Math.floor((uptime % (60 * 60)) / 60)
  const seconds = Math.floor(uptime % 60)

  return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds)
}
