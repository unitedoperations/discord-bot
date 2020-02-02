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

/**
 * Interface type for a parsed event from the forums calendar feed
 * @deprecated
 * @export
 * @interface CalendarEvent
 */
export interface CalendarEvent {
  id: number
  title: string
  date: Date
  url: string
  img?: string
  group: string
  reminders: Map<string, boolean>
  rsvpLimit?: number
  rsvps?: number
}

/**
 * State store for calendar events pulled from the forums
 * @deprecated
 * @export
 * @class EventStore
 * @property {Map<number, CalendarEvent>} _events
 */
class EventStore {
  private _events: Map<number, CalendarEvent> = new Map()

  /**
   * Returns if the argued ID exists in the events cache
   * @param {number} id
   * @returns {boolean}
   * @memberof EventStore
   */
  has(id: number): boolean {
    return this._events.has(id)
  }

  /**
   * Removes the argued event by ID if all reminders have occurred or
   * scheduled date is passed
   * @param {number} id
   * @returns {boolean}
   * @memberof EventStore
   */
  removeIfOld(id: number): boolean {
    const e: CalendarEvent | undefined = this._events.get(id)
    if (e !== undefined && [...e.reminders.values()].every(v => v)) {
      this._events.delete(id)
      return true
    }
    return false
  }

  /**
   * Sets the ID in the events cache to the argued CalendarEvent
   * @param {CalendarEvent} e
   * @memberof EventStore
   */
  add(e: CalendarEvent) {
    if (!this._events.has(e.id)) this._events.set(e.id, e)
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
