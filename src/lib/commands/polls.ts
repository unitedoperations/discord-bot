import { Message } from 'discord.js'
import { scrapeThreadsPage } from '../helpers'
import { pollsMessage } from '../messages'

/**
 * Pulls and returns a list of open voting threads from the forums
 * @export
 * @async
 * @param {Message} msg
 * @param {string[]} _args
 * @returns {Promise<string>}
 */
export async function polls(msg: Message, _args: string[]): Promise<string> {
  try {
    let openThreads = await scrapeThreadsPage(
      'http://forums.unitedoperations.net/index.php/forum/132-policy-voting-discussions/'
    )

    // Check if any open polls exist
    if (openThreads.length === 0) {
      const output = 'There are currently no open polls'
      await msg.author.send(output)
      return output
    }

    await msg.author.send({ embed: pollsMessage(openThreads, 'open') })
    return 'VOTING_THREADS_OUTPUT'
  } catch (e) {
    // If there was an error in any asynchronous operation
    const output = 'Could not retrieve voting thread data right now'
    await msg.author.send(output)
    return output
  }
}
