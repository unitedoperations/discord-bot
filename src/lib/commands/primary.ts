import { Message } from 'discord.js'
import { scrapeServerPage } from '../helpers'
import { serverMessage } from '../messages'

/**
 * Get the data about the current mission on the A3 primary server
 * @export
 * @async
 * @param {Message} msg
 * @param {string[]} _args
 * @returns {Promise<string>}
 */
export async function primary(msg: Message, _args: string[]): Promise<string> {
  try {
    let serverInfo = await scrapeServerPage('http://www.unitedoperations.net/tools/uosim/')
    if (!serverInfo) {
      serverInfo = {
        mission: 'None',
        description: 'Unknown',
        players: '0/64',
        island: 'Unknown',
        author: 'Unknown'
      }
    }

    await msg.author.send({ embed: serverMessage(serverInfo) })
    return 'SERVER_OUTPUT'
  } catch (e) {
    // If there was an error in any asynchronous operation
    const output = 'Could not retrieve primary server data right now'
    await msg.author.send(output)
    return output
  }
}
