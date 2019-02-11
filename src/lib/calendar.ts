import fetch, { RequestInit } from 'node-fetch'
import schedule from 'node-schedule'
import isFuture from 'date-fns/is_future'
import subMinute from 'date-fns/sub_minutes'
import subHour from 'date-fns/sub_hours'
import subDay from 'date-fns/sub_days'
import cheerio from 'cheerio'
import * as log from './logger'
import { Routine, Routinable } from './routine'
import { RoutineStore, EventStore, CalendarEvent, EnvStore } from './state'

type EventResponseEntity = {
  id: number
  url: string
  start: string
  title: string
  description: string
}

/**
 * Handles the RSS feed and parsing from the forums calendar
 * @export
 * @class Calendar
 * @implements Routinable
 * @property {string} _eventsUrl
 * @property {(string, CalendarEvent) => void} _sendReminder
 */
export class Calendar implements Routinable {
  // Calendar instance variables
  private _eventsUrl: string
  private _sendReminder: (r: string, e: CalendarEvent) => void

  /**
   * Creates an instance of Calendar.
   * @param {string} url
   * @param {(string, CalendarEvent) => void} reminderFunc
   * @memberof Calendar
   */
  constructor(url: string, reminderFunc: (r: string, e: CalendarEvent) => void) {
    this._sendReminder = reminderFunc
    this._eventsUrl = url

    // Add routine to the store for refreshing the calendar event feed
    RoutineStore.add(
      'event_updates',
      new Routine<void>(
        () => this.update(),
        [],
        EnvStore.HOURS_TO_REFRESH_CALENDAR * 60 * 60 * 1000
      )
    )
  }

  /**
   * Pull all of the calendar events from the forums
   * and update the in-memory store with those that
   * haven't been registered yet (newly found events)
   * @async
   * @memberof Calendar
   */
  async update() {
    try {
      const opts: RequestInit = {
        headers: {
          Authorization: EnvStore.apiAuthToken
        }
      }
      const res = await fetch(this._eventsUrl, opts).then(res => res.json())
      const futureEvents: EventResponseEntity[] = this._getFutureEvents(res.results)

      for (let e of futureEvents) {
        // If the event store doesn't have the event
        if (!EventStore.has(e.id)) {
          log.event(`New Event: ${e.title}`)

          // Parse the event title and description for the target player group
          // and the url for the image if one is present in the description
          const imgUrl: string = this._findImage(e.description)
          const group: string = this._findGroup(e.title)

          const newEvent: CalendarEvent = {
            id: e.id,
            title: e.title,
            date: new Date(e.start),
            url: e.url,
            img: imgUrl,
            group,
            reminders: new Map()
          }

          // For each interval set the default ran to false
          // and schedule the cron job for the reminder
          EnvStore.ALERT_TIMES.forEach(r => {
            newEvent.reminders.set(r, false)
            const [amt, type] = r.split(' ')

            // Determine the time to schedule the reminder for
            const time: Date = type.includes('minute')
              ? subMinute(newEvent.date, parseInt(amt))
              : type.includes('hour')
              ? subHour(newEvent.date, parseInt(amt))
              : subDay(newEvent.date, parseInt(amt))

            // Schedule reminder job if its in the future
            if (isFuture(time))
              schedule.scheduleJob(`${e.title}*@*${r}`, time, () => this._sendReminder(r, newEvent))
          })

          EventStore.add(e.id, newEvent)
        } else {
          EventStore.removeIfOld(e.id) ? log.info(`Deleted Event: ${e.title}`) : null
        }
      }
    } catch (e) {
      log.error(`CALENDAR UPDATE ${e.message}`)
    }
  }

  /**
   * Ends all routines running on intervals
   * @memberof Calendar
   */
  clear(): void {
    RoutineStore.terminate('event_updates')
  }

  /**
   * Uses a regular expression to parse and find the header image for the
   * RSS event's summary that is being passed in
   * @private
   * @param {string} html
   * @returns {string | null}
   */
  private _findImage(html: string): string {
    const $: CheerioStatic = cheerio.load(html)
    const img: string = $('img.bbc_img')
      .first()
      .attr('src')
    return img
  }

  /**
   * Parses the title of the event to find the group that it belongs to
   * @private
   * @param {string} title
   * @returns {string | null}
   * @memberof Calendar
   */
  private _findGroup(title: string): string {
    const groupMap = {
      uoa3: 'UOA3',
      'arma 3': 'UOA3',
      'event: arma 3': 'UOA3',
      uoaf: 'UOAF',
      'event: uoaf': 'UOAF',
      uotc: 'UOTC'
    }
    for (const [k, v] of Object.entries(groupMap)) {
      if (title.toLowerCase().startsWith(k)) return v
    }
    return ''
  }

  /**
   * Filters the input list of events for those that are in the future
   * @private
   * @param {EventResponseEntity[]} events
   * @returns {EventResponseEntity[]}
   * @memberof Calendar
   */
  private _getFutureEvents(events: EventResponseEntity[]): EventResponseEntity[] {
    const now = new Date()
    const future: EventResponseEntity[] = []

    for (const e of events) {
      if (new Date(e.start) >= now) future.push(e)
      else break
    }
    return future
  }
}
