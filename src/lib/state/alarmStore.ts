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
   * Register a new user for a player count alarm
   * @param {number} count
   * @param {User} user
   * @memberof AlarmStore
   */
  register(count: number, user: User) {
    if (!this._alarms.has(user)) this._alarms.set(user, count)
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
}

export default new AlarmStore()
