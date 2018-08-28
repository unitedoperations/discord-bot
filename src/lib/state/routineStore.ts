import { Routine } from '../routine'

/**
 * State store for subroutines used by the bot
 * @export
 * @class RoutineStore
 * @property {Map<string, Routine<any>>} cache
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
