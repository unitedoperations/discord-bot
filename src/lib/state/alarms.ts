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

/**
 * State store to manage player count alarms for the primary server
 * @export
 * @class AlarmStore
 * @property {Map<Discord.User, number>} _alarms
 */
class AlarmStore {
  private _alarms: Map<User, number> = new Map()

  /**
   * Finds and returns all User instances that are registered
   * for an alarm for a player count equal to or less than 'x'
   * @param {number} x
   * @returns {User[]}
   * @memberof AlarmStore
   */
  filter(x: number): User[] {
    return [...this._alarms.entries()].filter(e => e[1] <= x).map(e => e[0])
  }

  /**
   * Register a new user for a player count alarm.
   * Returns false if there was no alarm already registered for the user
   * and true if there was an alarm and it was overridden.
   * @param {number} count
   * @param {User} user
   * @returns {boolean}
   * @memberof AlarmStore
   */
  register(count: number, user: User): boolean {
    const existed = this._alarms.has(user)
    this._alarms.set(user, count)
    return existed
  }

  /**
   * Deregistered the user in the store for mission count alarms
   * @param {User} user
   * @returns {boolean}
   * @memberof AlarmStore
   */
  remove(user: User): boolean {
    return this._alarms.delete(user)
  }

  /**
   * Returns the number of alarms registered with the store
   * @returns {number}
   * @memberof AlarmStore
   */
  numberOfAlarms(): number {
    return this._alarms.size
  }
}

export default new AlarmStore()
