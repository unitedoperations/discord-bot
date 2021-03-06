/*
 * Copyright (C) 2020  United Operations
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

import fetch, { RequestInit } from 'node-fetch'
import schedule from 'node-schedule'
import addDays from 'date-fns/add_days'
import * as log from './logger'
import { Routine, Routinable } from './routine'
import { Routines, Env, Polls, PollType, PollRule, PollThread } from './state'

export type PollThreadResponse = PollThread & {
  id: number
  prefix: string
  tags: string[]
  firstPost: {
    date: string
  }
  date: string
  poll: {
    title: string
    questions: {
      options: {
        Yes: number
        No: number
      }
    }[]
  }
}

/**
 * Handle fetching new polls in the voting thread and alerting
 * regulars and officers of new polls when posted
 * @export
 * @class PollsHandler
 * @implements {Routinable}
 * @property {string} _pollsUrl
 * @property {(PollThread, 'open' | 'closed') => void} _sendAlert
 */
export class PollsHandler implements Routinable {
  // Polls instance variables
  private _pollsUrl: string
  private _sendAlert: (p: PollThread, status: 'open' | 'closed') => void

  /**
   * Creates an instance of Polls
   * @param {string} url
   * @param {(p: PollThread, status: 'open' | 'closed') => void} alertFunc
   * @memberof PollsHandler
   */
  constructor(url: string, alertFunc: (p: PollThread, status: 'open' | 'closed') => void) {
    this._sendAlert = alertFunc
    this._pollsUrl = url

    Routines.add(
      'poll_updates',
      new Routine<void>(() => this.update(), [], Env.HOURS_TO_REFRESH_FROM_FORUMS * 60 * 60 * 1000)
    )
  }

  /**
   * Pulls voting thread information from the forums API and
   * updates the in-memory store with those that haven't been
   * registered yet
   * @async
   * @memberof PollsHandler
   */
  async update() {
    try {
      const opts: RequestInit = {
        headers: {
          Authorization: Env.forumsAPIAuthToken
        }
      }
      const res = await fetch(this._pollsUrl, opts).then(r => r.json())
      const { results }: { results: PollThreadResponse[] } = res

      // Remove any closed polls if none are open
      if (results.length === 0) {
        Polls.getPolls().forEach(p => {
          Polls.removeIfOld(p.id) ? log.info(`Deleted Poll: ${p.question}`) : null
        })
        return
      }

      for (let p of results) {
        // If the poll store doesn't have the event
        if (!Polls.has(p.id)) {
          log.poll(`New Poll: ${p.poll.title}`)

          // Infer the poll type and closure date and create new object
          let rule: PollRule
          const tag: string = p.tags[0] || p.prefix
          switch (tag.toUpperCase()) {
            case 'OFFICER':
              rule = {
                type: PollType.Officer,
                percentToPass: 1 / 2,
                lengthInDays: 14
              }
              break
            case 'REGULAR':
              rule = {
                type: PollType.Regular,
                percentToPass: 2 / 3,
                lengthInDays: 7
              }
              break
            case 'ADDON':
              rule = {
                type: PollType.Addon,
                percentToPass: 3 / 4,
                lengthInDays: 14
              }
              break
            case 'CHARTER':
              rule = {
                type: PollType.Charter,
                percentToPass: 3 / 4,
                lengthInDays: 14
              }
              break
            case 'REMOVAL':
              rule = {
                type: PollType.Removal,
                percentToPass: 2 / 3,
                lengthInDays: 14
              }
              break
            default:
              throw new Error(`Found an unsupported voting thread tag: ${p.prefix}`)
          }

          const closeDate: Date = addDays(new Date(p.firstPost.date), rule.lengthInDays)

          const newPoll: PollThread = {
            id: p.id,
            rule,
            question: p.poll.title,
            closeDate,
            url: p.url,
            votes: {
              Yes: p.poll.questions[0].options.Yes,
              No: p.poll.questions[0].options.No
            }
          }

          // Alert the regulars channel of new poll threads
          await this._sendAlert(newPoll, 'open')

          // Schedule the poll closed message for the closure date
          schedule.scheduleJob(`poll_closed_${p.id}`, closeDate, () => this._sendAlert(newPoll, 'closed'))
        } else {
          Polls.update(p.id, p.poll.questions[0].options)
        }
      }
    } catch (e) {
      log.error(`POLL UPDATE ${e.message}`)
    }
  }

  /**
   * Ends all routines running on intervals
   * @memberof PollsHandler
   */
  clear(): void {
    Routines.terminate('poll_updates')
  }
}
