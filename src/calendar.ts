import FeedParser from 'feedparser'
import fetch, { Response } from 'node-fetch'
import cheerio from 'cheerio'
import signale from 'signale'
import { Routine, Routinable, hours } from './routine'

export interface CalendarEvent {
  guid: string
  title: string
  date: Date
  link: string
  img: string
}

/**
 * Handles the RSS feed and parsing from the forums calendar
 * @export
 * @class CalendarFeed
 * @implements Routinable
 * @property {FeedParser} _feed
 * @property {Promise<Response>} _req
 * @property {CalendarEvent[]} _eventsCache
 * @property {Routine<void>} _feedRoutine
 */
export class CalendarFeed implements Routinable {
  // Static and readonly variables for the CalendarFeed class
  private static readonly HOURS_TO_REFRESH = parseFloat(process.env.HOURS_TO_REFRESH_CALENDAR!)

  // CalendarFeed instance variables
  private _feed: FeedParser
  private _req: Promise<Response>
  private _eventsCache: CalendarEvent[] = []
  private _feedRoutine: Routine<void>

  /**
   * Creates an instance of CalendarFeed.
   * @param {string} url
   * @memberof CalendarFeed
   */
  constructor(url: string) {
    this._feed = new FeedParser({ feedurl: url })
    this._feed.on('readable', this._onFeedReadable)
    this._req = fetch(url)
    this._feedRoutine = new Routine<void>(
      () => this.pull(),
      [],
      hours(CalendarFeed.HOURS_TO_REFRESH)
    )
    this._feedRoutine.terminate()
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
   * @returns {CalendarEvent[]}
   * @memberof CalendarFeed
   */
  getEvents(): CalendarEvent[] {
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
    const events: CalendarEvent[] = []
    let e: FeedParser.Item

    while ((e = this._feed.read())) {
      const imgUrl: string = this._findImage(e.summary)
      events.push({
        guid: e.guid,
        title: e.title,
        date: e.date as Date,
        link: e.link,
        img: imgUrl
      })
    }

    if (events.length > 0) this._eventsCache = [...this._eventsCache, ...events]
  }

  /**
   * Uses a regular expression to parse and find the header image for the
   * RSS event's summary that is being passed in
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
}
