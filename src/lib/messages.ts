import { CalendarEvent, Group } from './state'
import { ServerInformation, ThreadInformation } from './helpers'

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
  description: `_...taking place in about **${away}**_`,
  url: event.link,
  image: {
    url: event.img
  }
})

/**
 * Creates the message structure for details requested for the
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
 * Creates the message structure for displaying the active and open
 * polls on the voting discussion and poll threads on the forums
 * @export
 * @param {ThreadInformation[]} threads
 * @returns {EmbedMessage}
 */
export const pollsMessage = (
  threads: ThreadInformation[],
  state: 'open' | 'close'
): EmbedMessage => ({
  color: 11640433,
  title: state === 'open' ? 'Open Polls' : 'Closed Polls',
  description:
    state === 'open'
      ? `_There are currently ${threads.length} active polls to vote on!_`
      : `_There were ${threads.length} polls clsoed!_`,
  fields: threads.map(t => ({ name: `${t.type || 'Other'}: ${t.title}`, value: t.link }))
})

/**
 * Creates the embed message for the pending scheduled alerts
 * @export
 * @param {{ [name: string]: string[] }} alerts
 * @returns {EmbedMessage}
 */
export const alertsMessage = (alerts: { [name: string]: string[] }): EmbedMessage => ({
  color: 11640433,
  title: '⏰ Scheduled Reminders',
  description: '_Pending timestamps for event reminders._',
  fields: Object.keys(alerts).map(k => ({ name: k, value: alerts[k].join('\n') }))
})

/**
 * Creates the embed message for the active list of LFG postings
 * @export
 * @param {Group[]} groups
 * @returns {EmbedMessage}
 */
export const groupsMessage = (groups: Group[]): EmbedMessage => {
  const items = groups.map(g => ({
    name: g.name,
    value: `${g.id} - ${g.found.length}/${g.needed} - started by ${g.owner.username}`
  }))

  return {
    color: 11640433,
    title: '👥 Active Groups Looking for Players',
    description: '_enter `!lfg join <id>` to join one of these active groups_',
    fields:
      items.length > 0
        ? items
        : [
            {
              name: 'No active groups looking for players...',
              value: 'If you want to make a new group, use the command `!lfg create <#> <name>`.'
            }
          ]
  }
}

/**
 * Creates the embed message to send the group owner and joiners when it is full
 * @export
 * @param {Group} g
 * @returns {EmbedMessage}
 */
export const groupFullMessage = (g: Group): EmbedMessage => ({
  color: 11640433,
  title: `🎉 LFG - ${g.name} is Full`,
  description: `_All ${
    g.needed
  } players required for the group have been found! Get in contact with ${
    g.owner.username
  } to play._`
})
