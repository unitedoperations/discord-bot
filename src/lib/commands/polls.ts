/*
 * Copyright (C) 2019  United Operations
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
      Authorization: Env.forumsAPIAuthToken
    }
  }

  const requests: Promise<PollThreadResponse>[] = Polls.getPolls().map(p => {
    return fetch(`${Env.FORUMS_API_BASE}/forums/topics/${p.id}`, opts).then(r => r.json())
  })

  const responses: PollThreadResponse[] = await Promise.all(requests)
  for (const res of responses) {
    Polls.update(res.id, res.poll.questions[0].options)
  }

  await msg.author.send({ embed: pollListingMessage(Polls.getPolls()) })
  return 'POLL_LISTING_OUTPUT'
}
