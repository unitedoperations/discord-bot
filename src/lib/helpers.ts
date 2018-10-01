import fetch from 'node-fetch'
import cheerio from 'cheerio'
import * as log from './logger'

/**
 * Interface type for primary server data
 * @export
 * @interface ServerInformation
 */
export interface ServerInformation {
  [k: string]: string
  players: string
  island: string
  mission: string
  author: string
  description: string
  feedbackURL: string
}

/**
 * Interface type for thread information list
 * @export
 * @interface ThreadInformation
 */
export interface ThreadInformation {
  title: string
  type: string
  link: string
}

/**
 * Scrapes the HTML of the A3 server page and returns the relevant data
 * @export
 * @async
 * @param {string} url
 * @returns {ServerInformation?}
 */
export async function scrapeServerPage(url: string): Promise<ServerInformation | null> {
  try {
    // Get the text HTML body of the webpage
    const res = await fetch(url)
    const body = await res.text()

    // Parse the HTML into a mock DOM with cheerio
    // Get an array of keys and array of values from the table data
    const $: CheerioStatic = cheerio.load(body)

    // Keys from the table of server data
    const keys: string[] = $('.sip_title')
      .map((_, el) => {
        const tmp = $(el)
          .text()
          .replace(':', '')
        if (tmp.includes(' ')) return tmp.split(' ')[1]
        return tmp
      })
      .get()

    // Values from the table of server data
    const values: string[] = $('.sip_value')
      .map((_, el) => $(el).text())
      .get()

    // Combine the keys and values into an object
    const serverInfo: { [k: string]: string } = {}
    for (let i = 0; i < keys.length; i++) serverInfo[keys[i].toLowerCase()] = values[i]
    serverInfo.feedbackURL = await getFeedbackURL(serverInfo.mission)

    return serverInfo as ServerInformation
  } catch (e) {
    log.error(`SERVER_SCRAPE: ${e.message}`)
    return null
  }
}

/**
 * Scrapes the HTML for the URL that points to a list of threads on the forums
 * @export
 * @async
 * @param {string} url
 * @returns {Promise<ThreadInformation[]>}
 */
// DEPRECATED:
export async function scrapeThreadsPage(url: string): Promise<ThreadInformation[]> {
  try {
    // Get the HTML from the web page
    // TODO: Resolve forums login issue
    const res = await fetch(url)
    const body = await res.text()

    // Parse the HTML into a mock DOM with cheerio
    const $: CheerioStatic = cheerio.load(body)
    const openThreads = $('tr.__topic')
      .map((_, el) => {
        // Check if the thread is closed or not, exit if locked
        const locked =
          $(el)
            .children('td.col_f_icon')
            .children('span')
            .attr('title') === 'This topic is locked'
        if (locked) return

        // Get elements with key values
        const content = $(el).children('td.col_f_content')
        const topic = content.find('a.topic_title')

        // Create object for the thread with type, link and title
        const type = content.children('a.ipsBadge').text()
        const link = topic.attr('href')
        const title = topic.children('span').text()
        return { type, link, title } as ThreadInformation
      })
      .toArray()

    // Weird work around for type casting bug
    return JSON.parse(JSON.stringify(openThreads)) as ThreadInformation[]
  } catch (e) {
    log.error(`THREAD_SCRAPE: ${e.message}`)
    return []
  }
}

/**
 * Finds the difference between the two argued arrays
 * @export
 * @template T
 * @param {T[]} a
 * @param {T[]} b
 * @returns {T[]}
 */
export function arrayDiff<T>(a: T[], b: T[]): T[] {
  return a.filter(x => !b.includes(x))
}

/**
 * Return whether the time difference string is a close match to the reminder value
 * @export
 * @param {string} reminder
 * @param {string} diff
 * @returns {boolean}
 */
export function timeDistanceMatch(reminder: string, diff: string): boolean {
  return reminder.split(' ').every(x => diff.split(' ').includes(x))
}

/**
 * Get the forums URL for feedback submission for the mission
 * @export
 * @async
 * @throws
 * @param {string} name
 * @returns {Promise<string>}
 */
export async function getFeedbackURL(name: string): Promise<string> {
  try {
    // Parse mission name for searching
    const searchName: string = name.replace(/[\s\-]/g, '_')
    const forumPage: string = `http://forums.unitedoperations.net/index.php/page/ArmA3/missionlist/_/livemissions/?search_value=${searchName}`

    // Get contents of the page with the URL
    const res = await fetch(forumPage)
    const body = await res.text()

    // Parse the HTML with Cheerio to retrieve the URL
    const $: CheerioStatic = cheerio.load(body)
    const url: string = $('table a').attr('href')
    return `${url}#fast_reply`
  } catch (e) {
    log.error(`FEEDBACK_URL_PULL: ${e.message}`)
    throw new Error(`failed to retrieve the feedback URL for ${name}`)
  }
}
