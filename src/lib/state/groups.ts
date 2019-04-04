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

import { User } from 'discord.js'
import schedule from 'node-schedule'
import addHour from 'date-fns/add_hours'

/**
 * Type definition for a group entity for LFG
 * @export
 * @interface Group
 */
export interface Group {
  id: number
  owner: User
  name: string
  needed?: number
  found: User[]
}

/**
 * Type definition for a flight entity for UOAF flights
 * @export
 * @interface Flight
 */
export interface Flight {
  id: number
  owner: User
  game: 'BMS' | 'DCS'
  time: Date
  details: string
  found: User[]
}

/**
 * Enum type for distinguishing between LFG or flight group maps
 * @export
 * @enum {number}
 */
export enum GroupType {
  LFG,
  Flight
}

/**
 * State store for managing the groups posted for the LFG feature
 * @export
 * @class GroupStore
 * @property {Map<number, Group>} _groups
 */
class GroupStore {
  private _groups: Map<number, Group> = new Map()
  private _flights: Map<number, Flight> = new Map()

  /**
   * Check if the argued user has already registered either
   * a group or a pickup flight that currently exists
   * @template T
   * @param {string} user
   * @param {T[]} items
   * @returns {boolean}
   * @memberof GroupStore
   */
  userAlreadyLooking<T extends Group | Flight>(user: string, items: T[]): boolean {
    for (const i of items) {
      if (i.owner.username === user) return true
    }
    return false
  }

  /**
   * Adds a new group instance to the map with the name as the key
   * @param {Group} g
   * @param {GroupType} t
   * @memberof GroupStore
   */
  add<T extends Group | Flight>(g: T, t: GroupType) {
    if (t === GroupType.LFG) {
      if (!this._groups.has(g.id)) {
        this._groups.set(g.id, g as Group)
        schedule.scheduleJob(`remove_group:${g.id}`, addHour(new Date(), 8), () =>
          this.remove(g.id, GroupType.LFG)
        )
      }
    } else {
      if (!this._flights.has(g.id)) {
        this._flights.set(g.id, g as Flight)
        schedule.scheduleJob(`remove_group:${g.id}`, addHour(new Date(), 8), () =>
          this.remove(g.id, GroupType.Flight)
        )
      }
    }
  }

  /**
   * Deletes a group instance from the store once it is full
   * @param {number} id
   * @param {GroupType} t
   * @memberof GroupStore
   */
  remove(id: number, t: GroupType) {
    t === GroupType.LFG ? this._groups.delete(id) : this._flights.delete(id)
  }

  /**
   * Adds a new user to the argued group ID and sends
   * a message to all found users if the group is full
   * @param {User} user
   * @param {number} id
   * @returns {{ full: boolean, group?: Group }}
   * @memberof GroupStore
   */
  joinGroup(user: User, id: number): { full: boolean; group?: Group } {
    const group = this._groups.get(id)
    if (!group) return { full: false }

    group.found.push(user)
    if (group.found.length === group.needed) {
      return { full: true, group }
    }
    return { full: false, group }
  }

  /**
   * Adds a new user to the flight group based on the argued ID
   * @param {User} user
   * @param {number} id
   * @returns {boolean}
   * @memberof GroupStore
   */
  joinFlight(user: User, id: number): { joined: boolean; flight?: Flight } {
    const flight = this._flights.get(id)
    if (!flight) return { joined: false }

    flight.found.push(user)
    return { joined: true, flight }
  }

  /**
   * Returns the array of Group entities stored
   * @returns {Group[]}
   * @memberof GroupStore
   */
  getGroups(): Group[] {
    return [...this._groups.values()]
  }

  /**
   * Returns the array of Flight entities stored
   * @returns {Flight[]}
   * @memberof GroupStore
   */
  getFlights(): Flight[] {
    return [...this._flights.values()]
  }
}

export default new GroupStore()
