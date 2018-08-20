import FeedParser from 'feedparser'
import fetch, { Response } from 'node-fetch'
import cheerio from 'cheerio'
import signale from 'signale'
import { Routine, Routinable } from './routine'

/**
 * The environment variable for alert times in hours
 * @export
 */
export const reminderIntervals: string[] = process.env.ALERT_TIMES!.split(',').map(t => t.trim())

/**
 * Interface type for a parsed event from the forums calendar feed
 * @export
 * @interface CalendarEvent
 */
export interface CalendarEvent {
  guid: string
  title: string
  date: Date
  link: string
  img: string
  group: string
  reminders: Map<string, boolean>
}

/**
 * Handles the RSS feed and parsing from the forums calendar
 * @export
 * @class CalendarFeed
 * @implements Routinable
 * @property {number} HOURS_TO_REFRESH
 * @property {FeedParser} _feed
 * @property {Promise<Response>} _req
 * @property {Map<string, CalendarEvent>} _eventsCache
 * @property {Routine<void>} _feedRoutine
 */
export class CalendarFeed implements Routinable {
  // Static and readonly variables for the CalendarFeed class
  private static readonly HOURS_TO_REFRESH: number = parseFloat(
    process.env.HOURS_TO_REFRESH_CALENDAR!
  )

  // CalendarFeed instance variables
  private _feed: FeedParser
  private _req: Promise<Response>
  private _eventsCache: Map<string, CalendarEvent> = new Map()
  private _feedRoutine: Routine<void>

  /**
   * Creates an instance of CalendarFeed.
   * @param {string} url
   * @memberof CalendarFeed
   */
  constructor(url: string) {
    // Create RSS feed parser
    this._feed = new FeedParser({ feedurl: url })
    this._feed.on('readable', this._onFeedReadable)

    // Request the URL for the calendar feed
    this._req = fetch(url)

    // Create a routine instance to handle pulling updates from the feed
    this._feedRoutine = new Routine<void>(
      () => this.pull(),
      [],
      CalendarFeed.HOURS_TO_REFRESH * 60 * 60 * 1000 // Hours to milliseconds
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
    signale.note('Pulled updates from calendar RSS feed')
    const res = await this._req
    res.body.pipe(this._feed)
  }

  /**
   * Returns the current state of the calendar events cache
   * @returns {Map<string, CalendarEvent>}
   * @memberof CalendarFeed
   */
  get events(): Map<string, CalendarEvent> {
    return this._eventsCache
  }

  /**
   * Ends all routines running on intervals
   * @memberof CalendarFeed
   */
  clear() {
    this._feedRoutine.terminate()
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

    while ((e = this._feed.read())) {
      signale.warn(`Event: ${e.title}`)

      if (!this._eventsCache.has(e.guid)) {
        const imgUrl: string = this._findImage(e.summary)
        const group: string = this._findGroup(e.title)
        const newEvent: CalendarEvent = {
          guid: e.guid,
          title: e.title,
          date: e.date as Date,
          link: e.link,
          img: imgUrl,
          group,
          reminders: new Map()
        }
        reminderIntervals.forEach(r => newEvent.reminders.set(r, false))
        this._eventsCache.set(e.guid, newEvent)
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
      'ArmA 3': 'UOA3',
      UOAF: 'UOAF',
      UOTC: 'UOTC'
    }
    for (const [k, v] of Object.entries(groupMap)) {
      if (title.startsWith(k)) return v
    }
    return ''
  }
}
