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

import { Routine } from '../routine'

/**
 * State store for subroutines used by the bot
 * @export
 * @class RoutineStore
 * @property {Map<string, Routine<any>>} _routines
 */
class RoutineStore {
  private _routines: Map<string, Routine<any>> = new Map()

  /**
   * Set a new Routine instance in the cache under the ID key argued
   * @param {string} id
   * @param {Routine<any>} r
   * @memberof RoutineStore
   */
  add(id: string, r: Routine<any>) {
    if (!this._routines.has(id)) this._routines.set(id, r)
  }

  /**
   * Terminate and delete a routine from the cache
   * @param {string} id
   * @memberof RoutineStore
   */
  terminate(id: string) {
    if (this._routines.has(id)) {
      ;(this._routines.get(id) as Routine<any>).terminate()
      this._routines.delete(id)
    }
  }
}

export default new RoutineStore()
