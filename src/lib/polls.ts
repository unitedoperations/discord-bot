import fetch, { RequestInit } from 'node-fetch'
import schedule from 'node-schedule'
import differenceInDays from 'date-fns/difference_in_days'
import addDays from 'date-fns/add_days'
import * as log from './logger'
import { Routine, Routinable } from './routine'
import { Routines, Env, Polls, PollType, PollThread } from './state'

type ThreadResponse = PollThread & {
  id: number
  prefix: string
  date: string
  poll: Record<'title', string>
}

/**
 * Handle fetching new polls in the voting thread and alerting
 * regulars and officers of new polls when posted
 * @export
 * @class PollsHandler
 * @implements {Routinable}
 * @property {string} _pollsUrl
 * @property {(PollThread) => void} _sendAlert
 */
export class PollsHandler implements Routinable {
  // Polls instance variables
  private _pollsUrl: string
  private _sendAlert: (p: PollThread) => void

  /**
   * Creates an instance of Polls
   * @param {string} url
   * @param {(p: PollThread) => void} alertFunc
   * @memberof PollsHandler
   */
  constructor(url: string, alertFunc: (p: PollThread) => void) {
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
    // FIXME:
    try {
      const opts: RequestInit = {
        headers: {
          Authorization: Env.apiAuthToken
        }
      }
      const res = await fetch(this._pollsUrl, opts).then(res => res.json())
      const openPolls: ThreadResponse[] = this._getOpenPolls(res.results)

      // Remove any closed polls if none are open
      if (openPolls.length === 0) {
        Polls.getPolls().forEach(p => {
          Polls.removeIfOld(p.id) ? log.info(`Deleted Poll: ${p.question}`) : null
        })
        return
      }

      for (let p of openPolls) {
        // If the poll store doesn't have the event
        if (!Polls.has(p.id)) {
          log.poll(`New Poll: ${p.question}`)

          // Infer the poll type and closure date and create new object
          const type: PollType =
            p.prefix === 'OFFICER'
              ? PollType.Officer
              : p.prefix === 'REGULAR'
              ? PollType.Regular
              : PollType.Addon

          const closeDate: Date =
            type === PollType.Addon || type === PollType.Officer
              ? addDays(new Date(p.date), 14)
              : addDays(new Date(p.date), 7)

          const newPoll: PollThread = {
            id: p.id,
            type,
            question: p.poll.title,
            closeDate,
            url: p.url
          }

          // Schedule the poll closed message for the closure date
          schedule.scheduleJob(`poll_closed_${p.id}`, newPoll.closeDate, () =>
            this._sendAlert(newPoll)
          )
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

  /**
   * Filter the input list of poll entities for those
   * that are still open for user voting
   * @private
   * @param {PollThread[]} polls
   * @returns {PollThread[]}
   * @memberof PollsHandler
   */
  private _getOpenPolls(polls: ThreadResponse[]): ThreadResponse[] {
    const now = new Date()
    const open: ThreadResponse[] = []

    for (const p of polls) {
      if (differenceInDays(new Date(p.date), now) <= 14) open.push(p)
      else break
    }
    return open
  }
}
