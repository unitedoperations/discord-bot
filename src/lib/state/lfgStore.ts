import { User } from 'discord.js'

/**
 * Type definition for a group entity for LFG
 * @export
 * @interface Group
 */
export interface Group {
  id: number
  owner: User
  name: string
  needed: number
  found: User[]
}

/**
 * State store for managing the groups posted for the LFG feature
 * @export
 * @class LFGStore
 * @property {Map<number, Group>} _groups
 */
class LFGStore {
  private _groups: Map<number, Group> = new Map()

  /**
   * @description
   * @param {string} user
   * @returns {boolean}
   * @memberof LFGStore
   */
  userAlreadyLooking(user: string): boolean {
    for (const g of [...this._groups.values()]) {
      if (g.owner.username === user) return true
    }
    return false
  }

  /**
   * Adds a new group instance to the map with the name as the key
   * @param {Group} g
   * @memberof LFGStore
   */
  add(g: Group) {
    if (!this._groups.has(g.id)) this._groups.set(g.id, g)
  }

  /**
   * Deletes a group instance from the store once it is full
   * @param {number} id
   * @memberof LFGStore
   */
  remove(id: number) {
    this._groups.delete(id)
  }

  /**
   * Adds a new user to the argued group ID and sends
   * a message to all found users if the group is full
   * @param {User} user
   * @param {number} id
   * @returns {{ full: boolean, group?: Group }}
   * @memberof LFGStore
   */
  join(user: User, id: number): { full: boolean; group?: Group } {
    const group = this._groups.get(id)
    if (!group) return { full: false }

    group.found.push(user)
    if (group.found.length === group.needed) {
      return { full: true, group }
    }
    return { full: false, group }
  }

  /**
   * Returns the array of Group entities stored
   * @returns {Group[]}
   * @memberof LFGStore
   */
  getGroups(): Group[] {
    return [...this._groups.values()]
  }
}

export default new LFGStore()
