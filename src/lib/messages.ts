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
 * @param {CalendarEvent} event
 * @returns {EmbedMessage}
 */
export const eventMessage = (event: CalendarEvent, x: number): EmbedMessage => ({
  color: 11640433,
  title: `**Reminder:** *${event.title}*`,
  description: `_...starting in **${x} hours**_`,
  url: event.link,
  image: {
    url: event.img
  }
})

export const serverMessage = (info: ServerInformation): EmbedMessage => ({
  color: 11640433,
  title: info.mission,
  description: `_${info.description.split('\n')[0]}_`,
  fields: [
    {
      name: 'Players',
      value: info.players
    },
    {
      name: 'Island',
      value: info.island
    },
    {
      name: 'Author',
      value: info.author
    }
  ]
})
