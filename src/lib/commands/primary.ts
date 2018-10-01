import { Message, Guild } from 'discord.js'
import { scrapeServerPage } from '../helpers'
import { serverMessage } from '../messages'

/**
 * Get the data about the current mission on the A3 primary server
 * @export
 * @async
 * @param {Discord.Guild} _guild
 * @param {Discord.Message} msg
 * @param {string[]} _args
 * @returns {Promise<string>}
 */
export async function primary(_guild: Guild, msg: Message, _args: string[]): Promise<string> {
  try {
    let serverInfo = await scrapeServerPage('http://www.unitedoperations.net/tools/uosim/')
    if (!serverInfo) {
      serverInfo = {
        mission: 'None',
        description: 'Unknown',
        players: '0/64',
        island: 'Unknown',
        author: 'Unknown',
        feedbackURL: ''
      }
    }

    await msg.author.send({ embed: serverMessage(serverInfo) })
    return 'SERVER_OUTPUT'
  } catch (e) {
    // If there was an error in any asynchronous operation
    await msg.author.send('Could not retrieve primary server data right now.')
    return 'SERVER_INFO_ERROR'
  }
}
