import fetch from 'node-fetch'
import cheerio from 'cheerio'
import signale from 'signale'
import { CalendarEvent } from '../calendar'

interface EmbedMessageImage {
  url: string | null
}

interface EmbedMessageField {
  name: string
  value: string
}

interface EmbedMessage {
  color: number
  title: string
  url?: string
  description: string
  thumbnail?: EmbedMessageImage
  image?: EmbedMessageImage
  fields?: EmbedMessageField[]
}

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
}

/**
 * Compiles the JSON object for the new users' welcome message
 * @export
 * @param {string} name
 * @returns {EmbedMessage}
 */
export const welcomeMessage = (name: string): EmbedMessage => ({
  color: 11640433, // Integer representation of UO color #B19E71
  title: `**Welcome to United Operations Discord, ${name}!**`,
  url: 'http://forums.unitedoperations.net',
  description: '*Tactical Gaming Community*',
  thumbnail: {
    url: 'https://units.arma3.com/groups/img/1222/vSClUszph6.png'
  },
  image: {
    url:
      'http://forums.unitedoperations.net/public/style_images/United_Operations___Animated/scooby_banner_bg.png'
  },
  fields: [
    {
      name: 'Getting Started (Arma 3)',
      value: 'http://www.unitedoperations.net/wiki/Getting_Started_Guide_(Arma_3)'
    },
    {
      name: 'Getting Started (BMS)',
      value: 'http://www.unitedoperations.net/wiki/BMS_Configuration_and_Setup'
    },
    {
      name: 'Community Wiki',
      value: 'http://www.unitedoperations.net/wiki/Main_Page'
    },
    {
      name: 'Forums',
      value: 'http://forums.unitedoperations.net/'
    },
    {
      name: 'Charter',
      value: 'http://www.unitedoperations.net/wiki/United_Operations_Charter'
    },
    {
      name: 'Server Information',
      value: 'http://forums.unitedoperations.net/index.php/page/servers'
    }
  ]
})

/**
 * Compiles the JSON object for an embed calendar event message
 * to remind everyone is the Discord server of the upcoming event
 * @export
 * @param {CalendarEvent} event
 * @returns {EmbedMessage}
 */
export const eventMessage = (event: CalendarEvent, away: string): EmbedMessage => ({
  color: 11640433,
  title: `**Reminder:** *${event.title}*`,
  description: `_...taking place in **${away}**_`,
  url: event.link,
  image: {
    url: event.img
  }
})

/**
 * Creates the messaged structure for details requested for the
 * primary A3 server
 * @export
 * @param {ServerInfo} info
 * @returns {EmbedMessage}
 */
export const serverMessage = (info: ServerInformation): EmbedMessage => ({
  color: 11640433,
  title: info.mission,
  description: `_${info.description.split('\n')[0]}_`,
  fields: [
    {
      name: 'Players',
      value: info.players || 'Unknown'
    },
    {
      name: 'Island',
      value: info.island || 'Unknown'
    },
    {
      name: 'Author',
      value: info.author || 'Unknown'
    }
  ]
})

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
    return serverInfo as ServerInformation
  } catch (e) {
    signale.error(`SERVER_SCRAPE: ${e.message}`)
    return null
  }
}
