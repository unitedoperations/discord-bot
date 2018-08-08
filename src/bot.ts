import * as Discord from 'discord.js'
import { CalendarFeed, CalendarEvent } from './calendar'

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
  url: string
  description: string
  thumbnail?: EmbedMessageImage
  image?: EmbedMessageImage
  fields?: EmbedMessageField[]
}

export class Bot {
  private _client: Discord.Client
  private _calendar: CalendarFeed

  constructor() {
    this._client = new Discord.Client()
    this._client.on('ready', () => console.log(`Logged in as ${this._client.user.tag}`))
    this._client.on('message', this._onMessage)
    this._client.on('guildMemberAdd', this._onNewMember)

    this._calendar = new CalendarFeed(
      'http://forums.unitedoperations.net/index.php/rss/calendar/1-community-calendar/'
    )
  }

  /**
   * Wrapper function for the Discord client's login function
   * to initialize and start the chat bot in the Discord server
   * @param token {string}
   * @returns {Promise<string>}
   * @memberof Bot
   */
  start = (token: string): Promise<string> => {
    this._calendar.pull()
    return this._client.login(token)
  }

  /**
   * Handler for when a new user joins the Discord server,
   * it generates a welcome message and send it through a
   * private message to the new user
   * @private
   * @param member {Discord.GuildMember}
   * @memberof Bot
   */
  private _onNewMember = (member: Discord.GuildMember) => {
    const username: string = member.user.username
    member.send({ embed: this._welcomeMessage(username) })
  }

  /**
   * Handler for when a new message is received to the bot
   * and it determines the current way to react based on the
   * command found. If the message it determined now to be a valid
   * command or was a message create by the bot, nothing happens
   * @private
   * @param msg {Discord.Message}
   * @memberof Bot
   */
  private _onMessage = (msg: Discord.Message) => {
    if (msg.author.bot) return

    const command: string[] = msg.content.split(' ')
    if (msg.content === 'new_user_test') {
      msg.channel.send({ embed: this._welcomeMessage(msg.author.username) })
    } else if (msg.content === 'test_events') {
      const events = this._calendar.events()
      const chan = msg.guild.channels.find('name', 'general') as Discord.TextChannel
      chan.send(`@here`, { embed: this._eventMessage(events[0]) as Discord.RichEmbed })
    } else if (command[0] === 'join_group') {
      const role = msg.guild.roles.find('name', command[1])
      msg.member.addRole(role, 'Role request through UO Bot')
    }
  }

  /**
   * Compiles the JSON object for the new users' welcome message
   * @private
   * @param name {string}
   * @returns {EmbedMessage}
   * @memberof Bot
   */
  private _welcomeMessage = (name: string): EmbedMessage => ({
    color: 11640433, // Integer representation of UO color #B19E71
    title: `**Welcome to United Operations Discord, ${name}!**`, // Bolded with markdown
    url: 'http://forums.unitedoperations.net',
    description: '*Placeholder description...*', // Italisized with markdown TODO: insert descr
    thumbnail: {
      url: 'https://units.arma3.com/groups/img/1222/vSClUszph6.png'
    },
    image: {
      url:
        'http://forums.unitedoperations.net/public/style_images/United_Operations___Animated/scooby_banner_bg.png'
    },
    fields: [
      {
        name: 'Server Information',
        value: 'http://forums.unitedoperations.net/index.php/page/servers'
      },
      {
        name: 'Charter',
        value: 'http://www.unitedoperations.net/wiki/United_Operations_Charter'
      }
    ]
  })

  /**
   * Compiles the JSON object for an embed calendar event message
   * to remind everyone is the Discord server of the upcoming event
   * @private
   * @param event {CalendarEvent}
   * @returns {EmbedMessage}
   * @memberof Bot
   */
  private _eventMessage = (event: CalendarEvent): EmbedMessage => ({
    color: 11640433,
    title: `**Reminder:** *${event.title}*`, // Styled with markdown
    url: event.link,
    description: '*Placeholder description...*', // TODO: Insert description of event
    image: {
      url: event.img
    }
  })
}
