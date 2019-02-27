/**
 * Enumeration of different types of forum polls
 * @export
 * @enum PollType
 */
export enum PollType {
  Regular = 'REGULAR',
  Officer = 'OFFICER',
  Addon = 'ADDON',
  Charter = 'CHARTER',
  Removal = 'REMOVAL'
}

/**
 * Interface type to define a poll type and its required
 * passing rate
 * @export
 * @interface PollRule
 */
export interface PollRule {
  type: PollType
  percentToPass: number
  lengthInDays: number
}

/**
 * Interface type for a poll thread on the forums
 * @export
 * @interface PollThread
 */
export interface PollThread {
  id: number
  rule: PollRule
  question: string
  closeDate: Date
  url: string
  votes: Record<'Yes' | 'No', number>
}

/**
 * State store for holding active forum polls
 * @export
 * @class PollStore
 * @property {Map<number, PollThread>} _polls
 */
class PollStore {
  private _polls: Map<number, PollThread> = new Map()

  /**
   * Returns if the argued poll thread ID is already stored
   * @param {number} id
   * @returns {boolean}
   * @memberof PollStore
   */
  has(id: number): boolean {
    return this._polls.has(id)
  }

  /**
   * Removes the argued poll thread by ID if the current date is
   * past the date of the poll's closure
   * @param {number} id
   * @returns {boolean}
   * @memberof PollStore
   */
  removeIfOld(id: number): boolean {
    const now = new Date()
    const p: PollThread | undefined = this._polls.get(id)
    if (p !== undefined && p.closeDate < now) {
      this._polls.delete(id)
      return true
    }
    return false
  }

  /**
   * Sets the ID in the poll thread cache for the argued PollThread
   * @param {number} id
   * @param {PollThread} p
   * @memberof EventStore
   */
  add(p: PollThread) {
    if (!this._polls.has(p.id)) this._polls.set(p.id, p)
  }

  /**
   * Update the vote counts for an existing poll in the store
   * @param {number} id
   * @param {(Record<'Yes' | 'No', number>)} votes
   * @memberof PollStore
   */
  update(id: number, votes: Record<'Yes' | 'No', number>) {
    if (this._polls.has(id)) {
      const old = this._polls.get(id) as PollThread
      this._polls.set(id, {
        ...old,
        votes
      })
    }
  }

  /**
   * Returns an array of all stored PollThread objects
   * @returns {PollThread[]}
   * @memberof PollStore
   */
  getPolls(): PollThread[] {
    return [...this._polls.values()]
  }
}

export default new PollStore()
