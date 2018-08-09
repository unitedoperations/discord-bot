/**
 * Converts a number into hours in milliseconds
 * @export
 * @param {number} x
 * @returns {number}
 */
export const hours = (x: number): number => x * 1000 * 60 * 60

/**
 * Converts a number into minutes in milliseconds
 * @export
 * @param {number} x
 * @returns {number}
 */
export const minutes = (x: number): number => x * 1000 * 60

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
