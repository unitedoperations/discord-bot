import FeedParser from 'feedparser'
import fetch, { Response } from 'node-fetch'

export interface CalendarEvent {
  guid: string
  title: string
  date: Date | null
  link: string
  img: string
}

/**
 * @description Handles the RSS feed and parsing from the forums calendar
 * @export
 * @class CalendarFeed
 */
export class CalendarFeed {
  private _feed: FeedParser
  private _req: Promise<Response>
  private _eventsCache: CalendarEvent[] = []

  constructor(url: string) {
    this._feed = new FeedParser({ feedurl: url })
    this._feed.on('readable', this._onFeedReadable)
    this._req = fetch(url)
  }

  /**
   * Pull all of the calendar events from the forums that
   * have not happened yet to parser them with the feed
   * parser instance by pipping the RSS stream into it
   * @async
   * @memberof CalendarFeed
   */
  async pull() {
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
      const imgUrl: string = this._findImage(e.summary) || ''
      events.push({
        guid: e.guid,
        title: e.title,
        date: e.date,
        link: e.link,
        img: imgUrl
      })
    }

    if (events.length > 0) this._eventsCache = events
  }

  /**
   * Uses a regular expression to parse and find the header image for the
   * RSS event's summary that is being passed in
   * @param {string} html
   * @returns {string | null}
   */
  private _findImage(html: string): string | null {
    const exp: RegExp = /<img\sclass='bbc_img'\ssrc='(.*)'\salt=.*\/>/g
    const match = exp.exec(html)
    if (match) return match[1]
    return null
  }
}
