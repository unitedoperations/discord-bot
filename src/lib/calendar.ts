import FeedParser from 'feedparser'
import fetch from 'node-fetch'
import schedule from 'node-schedule'
import isFuture from 'date-fns/is_future'
import subMinute from 'date-fns/sub_minutes'
import subHour from 'date-fns/sub_hours'
import subDay from 'date-fns/sub_days'
import cheerio from 'cheerio'
import * as log from './logger'
import { Routine, Routinable } from './routine'
import { RoutineStore, EventStore, CalendarEvent } from './state'

/**
 * The environment variable for alert times in hours
 * @export
 */
export const reminderIntervals: string[] = process.env.ALERT_TIMES!.split(',').map(t => t.trim())

/**
 * Handles the RSS feed and parsing from the forums calendar
 * @export
 * @class CalendarFeed
 * @implements Routinable
 * @property {number} HOURS_TO_REFRESH
 * @property {FeedParser?} _feed
 * @property {string} _feedUrl
 * @property {(string, CalendarEvent) => void} _sendReminder
 */
export class CalendarFeed implements Routinable {
  // Static and readonly variables for the CalendarFeed class
  private static readonly HOURS_TO_REFRESH: number = parseFloat(
    process.env.HOURS_TO_REFRESH_CALENDAR!
  )

  // CalendarFeed instance variables
  private _feed?: FeedParser
  private _feedUrl: string
  private _sendReminder: (r: string, e: CalendarEvent) => void

  /**
   * Creates an instance of CalendarFeed.
   * @param {string} url
   * @param {(string, CalendarEvent) => void} reminderFunc
   * @memberof CalendarFeed
   */
  constructor(url: string, reminderFunc: (r: string, e: CalendarEvent) => void) {
    this._sendReminder = reminderFunc
    this._feedUrl = url

    // Add routine to the store for refreshing the calendar event feed
    RoutineStore.add(
      'feed',
      new Routine<void>(() => this.pull(), [], CalendarFeed.HOURS_TO_REFRESH * 60 * 60 * 1000)
    )
  }

  /**
   * Pull all of the calendar events from the forums that
   * have not happened yet to parser them with the feed
   * parser instance by pipping the RSS stream into it
   * @async
   * @memberof CalendarFeed
   */
  async pull() {
    try {
      this._feed = new FeedParser({ feedurl: this._feedUrl })
      this._feed.on('readable', this._onFeedReadable)
      const res = await fetch(this._feedUrl)
      res.body.pipe(this._feed)
    } catch (e) {
      log.error(`PULL ${e.message}`)
    }
  }

  /**
   * Ends all routines running on intervals
   * @memberof CalendarFeed
   */
  clear(): void {
    RoutineStore.terminate('feed')
  }

  /**
   * Event handler for when the feed parser receives the
   * RSS stream from the request to the calendar to read the
   * entities. Each read RSS item is converted into a
   * {@type CalendarEvent} and stores them for later use
   * @private
   * @memberof CalendarFeed
   */
  private _onFeedReadable = () => {
    let e: FeedParser.Item

    // Continue to read the feed until no more events
    while ((e = this._feed!.read())) {
      // Ensure the events cache doesn't already contain the event
      if (!EventStore.has(e.guid)) {
        log.event(`New Event: ${e.title}`)

        const imgUrl: string = this._findImage(e.summary)
        const group: string = this._findGroup(e.title)

        // Check if the title of the event contains Zulu start time
        let date: Date = e.date as Date
        const startTime: string | null =
          e.title.trim().endsWith('z') || e.title.trim().endsWith('Z')
            ? e.title.trim().substr(e.title.length - 5, 4)
            : null

        // Reconstruct event date with found Zulu start time if it exists
        if (startTime) {
          const month =
            date.getUTCMonth() + 1 < 10 ? `0${date.getUTCMonth() + 1}` : date.getUTCMonth() + 1
          const day = date.getUTCDate() < 10 ? `0${date.getUTCDate()}` : date.getUTCDate()
          const d = `${date.getUTCFullYear()}-${month}-${day}`
          const t = `${startTime.substr(0, 2)}:${startTime.substr(2, 2)}Z`
          date = new Date(`${d}T${t}`)
        }

        // Create event object instance and add to the cache
        const newEvent: CalendarEvent = {
          guid: e.guid,
          title: e.title,
          date,
          link: e.link,
          img: imgUrl,
          group,
          reminders: new Map()
        }

        // For each interval set the default ran to false
        // and schedule the cron job for the reminder
        reminderIntervals.forEach(r => {
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
        EventStore.add(e.guid, newEvent)
      }
    }
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
   * @memberof CalendarFeed
   */
  private _findGroup(title: string): string {
    const groupMap = {
      'arma 3': 'UOA3',
      uoaf: 'UOAF',
      uotc: 'UOTC'
    }
    for (const [k, v] of Object.entries(groupMap)) {
      if (title.toLowerCase().startsWith(k)) return v
    }
    return ''
  }
}
