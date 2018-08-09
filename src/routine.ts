/**
 * Converts a number into hours in milliseconds
 * @export
 * @param {number} x
 * @returns {number}
 */
export const hours = (x: number): number => x * 1000 * 60 * 60

/**
 * Class to act as a persistent subroutine running in the background
 * @export
 * @class Routine
 * @property {NodeJS.Timer} _interval
 */
export class Routine<T> {
  private _interval: NodeJS.Timer

  constructor(fn: (...args: T[]) => void, args: T[], time: number) {
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
