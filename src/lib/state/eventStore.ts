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
 * State store for calendar events pulled from the forums
 * @export
 * @class EventStore
 * @property {Map<string, CalendarEvent>} _events
 */
class EventStore {
  private _events: Map<string, CalendarEvent> = new Map()

  /**
   * Returns if the argued ID exists in the events cache
   * @param {string} id
   * @returns {boolean}
   * @memberof EventStore
   */
  has(id: string): boolean {
    return this._events.has(id)
  }

  /**
   * Removes the argued event by ID if all reminders have occurred or
   * scheduled date is passed
   * @param {string} id
   * @memberof EventStore
   */
  removeIfOld(id: string) {
    const e: CalendarEvent | undefined = this._events.get(id)
    if (e !== undefined && [...e.reminders.values()].every(v => v)) {
      this._events.delete(id)
    }
  }

  /**
   * Sets the ID in the events cache to the argued CalendarEvent
   * @param {string} id
   * @param {CalendarEvent} e
   * @memberof EventStore
   */
  add(id: string, e: CalendarEvent) {
    if (!this._events.has(id)) this._events.set(id, e)
  }

  /**
   * Returns an array of all stored CalendarEvent objects
   * @returns {CalendarEvent[]}
   * @memberof EventStore
   */
  getEvents(): CalendarEvent[] {
    return [...this._events.values()]
  }
}

export default new EventStore()
