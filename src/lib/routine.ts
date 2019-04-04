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

/**
 * Implementable interface for classes using the Routine class
 * @export
 * @interface Routinable
 */
export interface Routinable {
  clear: () => void
}

/**
 * Class to act as a persistent subroutine running in the background
 * @export
 * @class Routine
 * @property {NodeJS.Timer} _interval
 */
export class Routine<T> {
  // Routine instance variables
  private _interval: NodeJS.Timer

  /**
   * Creates an instance of Routine.
   * @param {((...args: T[]) => void | Promise<void>)} fn
   * @param {T[]} args
   * @param {number} time
   * @memberof Routine
   */
  constructor(fn: (...args: T[]) => void | Promise<void>, args: T[], time: number) {
    this._interval = setInterval(() => fn(...args), time)
  }

  /**
   * Clears the routines operation
   * @memberof Routine
   */
  terminate() {
    clearInterval(this._interval)
  }
}
