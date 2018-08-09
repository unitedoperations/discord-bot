import Discord from 'discord.js'
import dateformat from 'dateformat'
import signale from 'signale'
import { CalendarFeed } from './calendar'
import { welcomeMessage } from './messages'

type BotAction = (msg: Discord.Message, args: string[]) => Promise<string>

/**
 * @description Wrapper class for the Discord SDK and handling custom commands
 * @export
 * @class Bot
 * @property calendar {readonly CalendarFeed}
 */
export class Bot {
  private static readonly LOG_CHANNEL: string = process.env.BOT_LOG_CHANNEL!
  // private static readonly MAIN_CHANNEL: string = process.env.BOT_MAIN_CHANNEL!

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
    member.send({ embed: welcomeMessage(username) })
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

    if (msg.content === 'new_user_test')
      msg.channel.send({ embed: welcomeMessage(msg.author.username) })

    // Check if the message actually is a command (starts with '!')
    if (cmd.startsWith('!')) {
      // Look for a handler function is the map that matches the command
      const fn = this._commands.get(cmdKey)
      if (fn) {
        // Delete the original command, run the handler and log the response
        msg
          .delete()
          .then(() => fn(msg, args))
          .then(output => this._log(msg.guild, msg.author.tag, [cmd, ...args].join(' '), output))
      } else {
        signale.error(`No command function found for '!${cmdKey}'`)
      }
    }
  }

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
