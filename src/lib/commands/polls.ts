import { Message, Guild } from 'discord.js'
import fetch, { RequestInit } from 'node-fetch'
import { Env, Polls } from '../state'
import { PollThreadResponse } from '../polls'
import { pollListingMessage } from '../messages'

/**
 * Pulls and returns a list of open voting threads from the forums
 * @export
 * @async
 * @param {Discord.Guild} _guild
 * @param {Discord.Message} msg
 * @param {string[]} _args
 * @returns {Promise<string>}
 */
export async function polls(_guild: Guild, msg: Message, _args: string[]): Promise<string> {
  const opts: RequestInit = {
    headers: {
      Authorization: Env.apiAuthToken
    }
  }

  const requests: Promise<PollThreadResponse>[] = Polls.getPolls().map(p => {
    return fetch(`${Env.API_BASE}/forums/topics/${p.id}`, opts).then(r => r.json())
  })

  const responses: PollThreadResponse[] = await Promise.all(requests)
  for (const res of responses) {
    Polls.update(res.id, res.poll.questions[0].options)
  }

  await msg.author.send({ embed: pollListingMessage(Polls.getPolls()) })
  return 'POLL_LISTING_OUTPUT'
}
