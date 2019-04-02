import { Message, GuildMember } from 'discord.js'
import { Bot } from '../bot'
import { CalendarEvent, Group, Flight, PollThread } from './state'
import { ServerInformation } from './helpers'
import { UserEntity } from './commands/user'

interface EmbedMessageImage {
  url: string | null
}

interface EmbedMessageField {
  name: string
  value: string | number
}

interface EmbedMessage {
  color: number
  author?: {
    name: string
    icon_url: string
  }
  title?: string
  url?: string
  description?: string
  thumbnail?: EmbedMessageImage
  image?: EmbedMessageImage
  fields?: EmbedMessageField[]
}

/**
 * Create the help message embed for the !? and !help commands
 * @export
 * @param {Map<string, string>} descriptions
 * @returns {EmbedMessage}
 */
export const helpMessage = (descriptions: Map<string, string>): EmbedMessage => ({
  color: 11640433,
  title: '**Commands**',
  description:
    '_All bug reports and feature requests are submitted as issues at https://github.com/unitedoperations/uo-discordbot_',
  fields: [...descriptions.entries()].map(e => ({ name: e[0], value: e[1] }))
})

/**
 * Embed message structure for updates to the bot being announced to a Discord channel
 * @export
 * @param {string} newVersion
 * @returns {EmbedMessage}
 */
export const updateMessage = (newVersion: string): EmbedMessage => ({
  color: 11640433,
  title: `🤖 **Upgrade to v${newVersion}!**`,
  description:
    '_Run the `!?` or `!help` command to see if any new commands were added, or read to changelog to see everything that was updated._',
  fields: [
    {
      name: 'Changelog',
      value:
        '[Read the changelog for a full list of updates.](https://github.com/unitedoperations/uo-discordbot/blob/master/.github/CHANGELOG.md)'
    }
  ]
})

/**
 * Compiles the JSON object for the new users' welcome message
 * @export
 * @param {string} name
 * @returns {EmbedMessage}
 */
export const welcomeMessage = (name: string): EmbedMessage => ({
  color: 11640433, // Integer representation of UO color #B19E71
  title: `👋🏼 **Welcome to United Operations Discord, ${name}!**`,
  url: 'https://unitedoperations.net/forums/',
  description: '*Tactical Gaming Community*',
  thumbnail: {
    url: 'https://units.arma3.com/groups/img/1222/vSClUszph6.png'
  },
  image: {
    url: 'https://i.imgur.com/8sbhN8F.png'
  },
  fields: [
    {
      name: 'Getting Started (Arma 3)',
      value: 'https://wiki.unitedoperations.net/wiki/Getting_Started_Guide_(Arma_3)'
    },
    {
      name: 'Getting Started (BMS)',
      value: 'https://wiki.unitedoperations.net/wiki/BMS_Configuration_and_Setup'
    },
    {
      name: 'Community Wiki',
      value: 'https://wiki.unitedoperations.net/wiki/Main_Page'
    },
    {
      name: 'Forums',
      value: 'https://unitedoperations.net/forums/'
    },
    {
      name: 'Charter',
      value: 'https://wiki.unitedoperations.net/wiki/United_Operations_Charter'
    },
    {
      name: 'Server Information',
      value: 'https://unitedoperations.net/forums/index.php?/servers/'
    }
  ]
})

/**
 * Embed message for the bot information request
 * @export
 * @returns {EmbedMessage}
 */
export const aboutMessage = (): EmbedMessage => ({
  color: 11640433,
  title: '**ℹ️ Bot Information**',
  description: '_Details about the bot_',
  fields: [
    {
      name: 'Version',
      value: Bot.VERSION
    },
    {
      name: 'Developer',
      value: 'Synxe'
    },
    {
      name: 'Stack',
      value: 'TypeScript, Shell, Docker, Terraform'
    },
    {
      name: 'Repository',
      value: 'https://github.com/unitedoperations/uo-discordbot'
    },
    {
      name: 'Feature Requests & Bug Reports',
      value: 'https://github.com/unitedoperations/uo-discordbot/issues'
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
export const reminderMessage = (event: CalendarEvent, away: string): EmbedMessage => {
  const msg: EmbedMessage = {
    color: 11640433,
    title: `🔔 **Reminder:** *${event.title}*`,
    description: `_...taking place in about **${away}**_`,
    url: event.url,
    image: {
      url: event.img
    }
  }

  if (event.rsvpLimit)
    msg.fields = [{ name: 'RSVPs', value: `${event.rsvps}/${event.rsvpLimit} spots taken` }]

  return msg
}

/**
 * Embed message creater for displaying all pending community events
 * @export
 * @param {CalendarEvents[]} events
 * @returns {EmbedMessage}
 */
export const eventsMessage = (events: CalendarEvent[]): EmbedMessage => ({
  color: 11640433,
  title: '⏳ **Community Events**',
  description: `_There are a total of ${events.length} upcoming community events!_`,
  fields: events.map(e => ({ name: e.title, value: e.url }))
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
  title: `**${info.mission}**`,
  description:
    info.description !== '' ? `_${info.description.split('\n')[0]}_` : `_No description_`,
  thumbnail: {
    url: 'https://units.arma3.com/groups/img/1222/vSClUszph6.png'
  },
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
    },
    {
      name: 'Leave Feedback',
      value: info.feedbackURL
    }
  ]
})

/**
 * Creates the message structure for displaying the active and open
 * polls on the voting discussion and poll threads on the forums
 * @export
 * @param {PollThread} poll
 * @param {('open' | 'closed')} status
 * @returns {EmbedMessage}
 */
export const pollAlertMessage = (poll: PollThread, status: 'open' | 'closed'): EmbedMessage => {
  let fields: EmbedMessageField[] = [
    {
      name: `${poll.rule.type}: ${poll.question}`,
      value: poll.url
    }
  ]

  if (status === 'closed') {
    const toPercent = (total: number, x: number): number => x / total

    const { Yes, No } = poll.votes
    const percentYes = toPercent(Yes + No, Yes)
    const prefix = percentYes >= poll.rule.percentToPass ? '✅' : '❌'

    fields.push({
      name: 'Final Result',
      value: `${prefix} **Yes**: ${percentYes * 100}%, with ${Yes + No} total votes.`
    })
  }

  return {
    color: 11640433,
    title: status === 'open' ? '📊 **New Poll**' : '🔒 **Poll Closed**',
    description:
      status === 'open'
        ? `_A new poll has been created in the voting section of the forums!_`
        : `_A pending poll has just ended!_`,
    fields
  }
}

/**
 * Creates an embed message for the listing of active voting threads
 * @export
 * @param {PollThread[]} polls
 * @returns {EmbedMessage}
 */
export const pollListingMessage = (polls: PollThread[]): EmbedMessage => ({
  color: 11640433,
  title: '📊 **Active Polls**',
  description:
    polls.length > 0
      ? `_There are ${polls.length} active polls on the forums!_`
      : `_There are currently no active polls on the forums._`,
  fields: polls.map(p => ({ name: p.question, value: p.url }))
})

/**
 * Creates the embed message for the pending scheduled alerts
 * @export
 * @param {Record<string, string[]>} alerts
 * @returns {EmbedMessage}
 */
export const alertsMessage = (alerts: Record<string, string[]>): EmbedMessage => ({
  color: 11640433,
  title: '**⏰ Scheduled Reminders**',
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
    title: '**👥 Active Groups Looking for Players**',
    description: '_Run `!lfg join <id>` to join one of these active groups_',
    fields:
      items.length > 0
        ? items
        : [
            {
              name: 'No active groups looking for players...',
              value: 'To make a new group, use the command `!lfg create <# needed> <name>`.'
            }
          ]
  }
}

/**
 * Message structure for listing all existing pickup flights
 * @export
 * @param {Flight[]} flight
 * @returns {EmbedMessage}
 */
export const flightsMessage = (flights: Flight[]): EmbedMessage => {
  const items = flights.map(f => ({
    name: `${f.game}`,
    value: `${f.id} - started by ${f.owner.username}`
  }))

  return {
    color: 11640433,
    title: '**🛩 Active Pickup Flights**',
    description: 'Run `!flight join <id>` to join of these flights_',
    fields:
      items.length > 0
        ? items
        : [
            {
              name: 'No active pickup flights waiting for players...',
              value:
                'To create a flight, use the command `!flight create <BMS|DCS> <HHMM> <MM/DD> <details>`.'
            }
          ]
  }
}

/**
 * Message for the general channel announcement of a new group for LFG created
 * @export
 * @param {Group} g
 * @returns {EmbedMessage}
 */
export const groupCreatedMessage = (g: Group): EmbedMessage => ({
  color: 11640433,
  title: `👥 _**${g.owner.username}**_ Created Group **${g.name}**`,
  description: `_Looking for **${g.needed}** players! To join use \`!lfg join ${
    g.id
  }\`. This group will expire in 12 hours._`
})

/**
 * Message for the UOAF flights channel to alert of a newly created flight
 * @export
 * @param {Flight} f
 * @returns {EmbedMessage}
 */
export const flightCreatedMessage = (f: Flight): EmbedMessage => ({
  color: 11640433,
  title: `🛩 _**${f.owner.username}**_ Created Flight **${f.game}-${f.id}**`,
  description: `_You can join this pickup flight by running \`!flight join ${
    f.id
  }\`. This flight will expire in 12 hours._`
})

/**
 * Creates the embed message to send the group owner and joiners when it is full
 * @export
 * @param {Group} g
 * @returns {EmbedMessage}
 */
export const groupFullMessage = (g: Group): EmbedMessage => ({
  color: 11640433,
  title: `**🎉 LFG - ${g.name} is Full**`,
  description: `_All ${
    g.needed
  } players required for the group have been found! Get in contact with ${
    g.owner.username
  } to play._`
})

/**
 * Creates an embed message for display mission name search results
 * @export
 * @param {string[]} names
 * @returns {EmbedMessage}
 */
export const missionsMessage = (search: string[], names: string[]): EmbedMessage => ({
  color: 11640433,
  title: `**🗺 Mission Search Results: _${search.join(' ')}_**`,
  description: names.length > 0 ? `${names.join('\n').replace(/_/g, '-')}` : 'No results found.'
})

/**
 * Create an embed message for alarming users of the player count
 * @export
 * @param {number} x
 * @returns {EmbedMessage}
 */
export const alarmMessage = (x: number): EmbedMessage => ({
  color: 11640433,
  title: '**🚨 Player Count Alert**',
  description: `_The primary server has reached or exceeded **${x}** players!_`
})

/**
 * Embed message for showing the bot process statistics
 * @param {string} uptime
 * @param {number} reqs
 * @param {number} newMembers
 * @param {number} events
 * @param {number} alarms
 * @param {number} groups
 * @returns {EmbedMessage}
 */
export const statsMessage = (
  uptime: string,
  reqs: number,
  newMembers: number,
  events: number,
  alarms: number,
  groups: number
): EmbedMessage => ({
  color: 11640433,
  title: '**🔢 Runtime Statistics**',
  description: '_Statistics about the chatbot and its runtime process._',
  fields: [
    {
      name: 'Uptime',
      value: uptime
    },
    {
      name: 'Total Requests',
      value: reqs
    },
    {
      name: 'New Members Joined',
      value: newMembers
    },
    {
      name: 'Upcoming Events',
      value: events
    },
    {
      name: 'Pending Alarms',
      value: alarms
    },
    {
      name: 'Groups Waiting',
      value: groups
    }
  ]
})

/**
 * Embed message for responding to the !user command for authentication information
 * @param {UserEntity} user
 * @returns {EmbedMessage}
 */
export const authenticatedUserMessage = (user: UserEntity): EmbedMessage => ({
  color: 11640433,
  title: `**👤 ${user.username}'s Information**`,
  description: `_Information stored about their authentication and clients_`,
  fields: [
    {
      name: 'Last Authentication Date',
      value: user.createdAt
    },
    {
      name: 'Email Address',
      value: user.email
    },
    {
      name: 'Discord ID',
      value: user.discord_id
    },
    {
      name: 'Forums ID',
      value: user.forums_id
    },
    {
      name: 'TeamSpeak ID',
      value: user.teamspeak_id
    },
    {
      name: 'TeamSpeak Database ID',
      value: user.teamspeak_db_id
    },
    {
      name: 'Last Known IP Address',
      value: user.ip
    }
  ]
})

/**
 * Log message format for when a message was deleted
 * @param {string} time
 * @param {Discord.Message} msg
 * @returns {EmbedMessage}
 */
export const messageDeletedLogMessage = (time: string, msg: Message): EmbedMessage => ({
  color: 15090499,
  author: {
    name: 'Message Deleted',
    icon_url: msg.author.avatarURL
  },
  fields: [
    {
      name: '**Member**',
      value: msg.author.tag
    },
    {
      name: '**Channel**',
      value: msg.channel.toString()
    },
    {
      name: '**Message Created At**',
      value: new Date(msg.createdTimestamp).toUTCString()
    },
    {
      name: '**Message Deleted At**',
      value: time
    },
    {
      name: '**Contents**',
      value: msg.content
    }
  ]
})

/**
 * Log message format for when a message was updated or edited
 * @param {string} time
 * @param {Discord.Message} oldMsg
 * @param {Discord.Message} newMsg
 * @returns {EmbedMessage}
 */
export const messageUpdatedLogMessage = (
  time: string,
  oldMsg: Message,
  newMsg: Message
): EmbedMessage => ({
  color: 11617254,
  author: {
    name: 'Message Updated',
    icon_url: newMsg.author.avatarURL
  },
  fields: [
    {
      name: '**Member**',
      value: newMsg.author.tag
    },
    {
      name: '**Channel**',
      value: newMsg.channel.toString()
    },
    {
      name: '**Message Created At**',
      value: new Date(oldMsg.createdTimestamp).toUTCString()
    },
    {
      name: '**Message Updated At**',
      value: time
    },
    {
      name: '**Original**',
      value: oldMsg.content
    },
    {
      name: '**New**',
      value: newMsg.content
    }
  ]
})

/**
 * Log message for when a user executes a bot command
 * @param {Discord.Message} msg
 * @param {string} output
 * @returns {EmbedMessage}
 */
export const commandUseLogMessage = (msg: Message, output: string): EmbedMessage => ({
  color: 4449937,
  author: {
    name: 'Command Executed',
    icon_url: msg.author.avatarURL
  },
  fields: [
    {
      name: '**Member**',
      value: msg.author.tag
    },
    {
      name: '**Command**',
      value: msg.content
    },
    {
      name: '**Executed At**',
      value: new Date(msg.createdTimestamp).toUTCString()
    },
    {
      name: '**Output**',
      value: output
    }
  ]
})

/**
 * Log message for when a user roles are changed by the authentication system
 * @param {Discord.GuildMember} member
 * @param {string} action
 * @param {string} result
 * @returns {EmbedMessage}
 */
export const rolesUpdatedLogMessage = (
  member: GuildMember,
  action: string,
  result: string
): EmbedMessage => ({
  color: 15110979,
  author: {
    name: 'Roles Updated',
    icon_url: member.user.avatarURL
  },
  fields: [
    {
      name: '**Member**',
      value: member.user.tag
    },
    {
      name: '**Action**',
      value: action
    },
    {
      name: '**Updated At**',
      value: new Date().toUTCString()
    },
    {
      name: '**Result**',
      value: result
    }
  ]
})
