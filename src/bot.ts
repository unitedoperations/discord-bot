import * as Discord from 'discord.js'
import dateformat from 'dateformat'
import signale from 'signale'
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

type BotAction = (msg: Discord.Message, args: string[]) => Promise<string>

/**
 * @description Wrapper class for the Discord SDK and handling custom commands
 * @export
 * @class Bot
 * @property calendar {readonly CalendarFeed}
 */
export class Bot {
  private static readonly LOG_CHANNEL: string = process.env.BOT_LOG_CHANNEL!
  private static readonly MAIN_CHANNEL: string = process.env.BOT_MAIN_CHANNEL!

  public readonly calendar: CalendarFeed
  private _client: Discord.Client
  private _commands: Map<string, BotAction> = new Map()

  constructor() {
    this._client = new Discord.Client()
    this._client.on('ready', () => signale.info(`Logged in as ${this._client.user.tag}`))
    this._client.on('message', this._onMessage)
    this._client.on('guildMemberAdd', this._onNewMember)

    this.calendar = new CalendarFeed(
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
    this.calendar.pull()
    return this._client.login(token)
  }

  /**
   * Adds a new command action to the map under a key
   * that is the command string for application to the
   * _onMessage handler at start
   * @param {string} cmd
   * @param {(Discord.Message) => void} action
   * @memberof Bot
   */
  addCommand = (cmd: string, action: BotAction) => {
    this._commands.set(cmd, action)
  }

  /**
   * Handler for when a new user joins the Discord server,
   * it generates a welcome message and send it through a
   * private message to the new user
   * @private
   * @param {Discord.GuildMember} member
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
   * @param {Discord.Message} msg
   * @memberof Bot
   */
  private _onMessage = (msg: Discord.Message) => {
    // Skip message if came from bot
    if (msg.author.bot) return

    // Get the command and its arguments from received message
    const [cmd, ...args] = msg.content.split(' ')
    const cmdKey = cmd.slice(1)

    // Check if the message actually is a command (starts with '!')
    if (cmd.startsWith('!')) {
      // Look for a handler function is the map that matches the command
      const fn = this._commands.get(cmdKey)
      if (fn) {
        fn(msg, args).then(async (output: string) => {
          await msg.delete()
          this._log(msg.guild, msg.author.tag, [cmd, ...args].join(' '), output)
        })
      } else {
        signale.error(`No command function found for '!${cmdKey}'`)
      }
    }
  }

  /**
   * Compiles the JSON object for the new users' welcome message
   * @private
   * @param {string} name
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
        name: 'Getting Started (UOA3)',
        value: 'http://www.unitedoperations.net/wiki/Getting_Started_Guide_(Arma_3)'
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
   * @private
   * @param {CalendarEvent} event
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

  /**
   * Logs all commands run through the bot to the designated logging
   * channel on the Discord server with the essential date and timestamp
   * @private
   * @param {Discord.Guild} guild
   * @param {string} tag
   * @param {string} cmd
   * @param {string} output
   * @memberof Bot
   */
  private _log = (guild: Discord.Guild, tag: string, cmd: string, output: string) => {
    const timestamp = dateformat(new Date(), 'UTC:HH:MM:ss|yy-mm-dd')
    const logChannel = guild.channels.find('name', Bot.LOG_CHANNEL) as Discord.TextChannel
    logChannel.send(`${tag} ran "${cmd}" at time ${timestamp}: "${output}"`)
  }
}
