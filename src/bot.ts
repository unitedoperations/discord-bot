import Discord from 'discord.js'
import dateformat from 'dateformat'
import signale from 'signale'
import distanceInWords from 'date-fns/distance_in_words_strict'
import { CalendarFeed, reminderIntervals } from './calendar'
import { welcomeMessage, eventMessage } from './lib/messages'
import { Routine, Routinable } from './routine'

type BotAction = (msg: Discord.Message, args: string[]) => Promise<string>

/**
 * Wrapper class for the Discord SDK and handling custom commands
 * @export
 * @class Bot
 * @implements Routinable
 * @property {string} GUILD_NAME
 * @property {string} LOG_CHANNEL
 * @property {string} MAIN_CHANNEL
 * @property {CalendarFeed} _calendar
 * @property {Discord.Client} _client
 * @property {Map<string, BotAction>} _commands
 * @property {Routine<void> | undefined} _calendarRoutine
 */
export class Bot implements Routinable {
  // Static and readonly variables for the Bot class
  private static readonly GUILD_ID: string = process.env.DISCORD_SERVER_ID!
  private static readonly LOG_CHANNEL: string = process.env.DISCORD_LOG_CHANNEL!
  private static readonly MAIN_CHANNEL: string = process.env.DISCORD_MAIN_CHANNEL!
  private static readonly ARMA_CHANNEL: string = process.env.DISCORD_ARMA_CHANNEL!
  private static readonly BMS_CHANNEL: string = process.env.DISCORD_BMS_CHANNEL!

  // Bot instance variables
  private _guild?: Discord.Guild
  private _calendar: CalendarFeed
  private _client: Discord.Client
  private _commands: Map<string, BotAction> = new Map()
  private _calendarRoutine?: Routine<void>

  /**
   * Creates an instance of Bot
   * @memberof Bot
   */
  constructor() {
    this._client = new Discord.Client()
    this._client.on('ready', () => {
      signale.fav(`Logged in as ${this._client.user.tag}`)
      this._guild = this._client.guilds.find('id', Bot.GUILD_ID)
    })
    this._client.on('message', this._onMessage)
    this._client.on('guildMemberAdd', this._onNewMember)

    this._calendar = new CalendarFeed(
      'http://forums.unitedoperations.net/index.php/rss/calendar/1-community-calendar/'
    )
  }

  /**
   * Wrapper function for the Discord client's login function
   * to initialize and start the chat bot in the Discord server
   * @async
   * @param token {string}
   * @returns {Promise<string>}
   * @memberof Bot
   */
  async start(token: string): Promise<string> {
    // Initial calendar feed pull, handled by routine in CalendarFeed instance after
    await this._calendar.pull()

    // Create a new routine to check for notifications on events on an interval
    this._calendarRoutine = new Routine<void>(
      async () => await this._notifyOfEvents(),
      [],
      1 * 60 * 1000 // Minutes to millisecond
    )

    // Login with the Discord client
    return this._client.login(token)
  }

  /**
   * Ends all routines running on intervals
   * @memberof Bot
   */
  clear() {
    ;(this._calendarRoutine as Routine<any>).terminate()
  }

  /**
   * Adds a new command action to the map under a key
   * that is the command string for application to the
   * _onMessage handler at start
   * @param {string} cmd
   * @param {(Discord.Message) => void} action
   * @memberof Bot
   */
  addCommand(cmd: string, action: BotAction) {
    this._commands.set(cmd, action)
  }

  /**
   * Pulls updates from the RSS event feed and send reminds if necessary
   * after comparing the start time of the event and the current time
   * @private
   * @async
   * @memberof Bot
   */
  private async _notifyOfEvents() {
    const now = new Date()
    this._calendar.events.forEach(async e => {
      // Get the time difference between now and the event date
      const diff = distanceInWords(e.date, now)

      // Check if the time difference matches a configured time reminder
      if (reminderIntervals.some(r => r === diff) && !e.reminders.get(diff)) {
        signale.star(`Sending notification for event: ${e.title}`)

        // Ensure it won't send this same reminder type again
        e.reminders.set(diff, true)

        // If hour difference is within the remind window, send message to
        // all users of the designated group with the reminder in the main channel
        const msg = eventMessage(e, diff) as Discord.RichEmbed

        // Determine the channel that the message should be send to and who to tag
        let channel: Discord.TextChannel
        let role: Discord.Role | null
        switch (e.group) {
          // ArmA 3 event reminder
          case 'UOA3':
            role = this._guild!.roles.find('name', e.group)
            channel = this._guild!.channels.find('id', Bot.ARMA_CHANNEL) as Discord.TextChannel
            break
          // BMS event reminder
          case 'UOAF':
            role = this._guild!.roles.find('name', e.group)
            channel = this._guild!.channels.find('id', Bot.BMS_CHANNEL) as Discord.TextChannel
            break
          // UOTC course reminder
          case 'UOTC':
            role = null
            channel = this._guild!.channels.find('id', Bot.ARMA_CHANNEL) as Discord.TextChannel
            break
          // Unknown event type reminder
          default:
            role = null
            channel = this._guild!.channels.find('id', Bot.MAIN_CHANNEL) as Discord.TextChannel
        }

        // Dispatch event reminder to correct group and channel
        await channel.send(role ? role.toString() : '', { embed: msg })
      }
    })
  }

  /**
   * Handler for when a new user joins the Discord server,
   * it generates a welcome message and send it through a
   * private message to the new user
   * @private
   * @async
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

    if (msg.content === 'test_events') {
      this._calendar.events.forEach(e => msg.channel.send({ embed: eventMessage(e, '2 hours') }))
    }

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
   * @async
   * @param {Discord.Guild} guild
   * @param {string} tag
   * @param {string} cmd
   * @param {string} output
   * @memberof Bot
   */
  private _log(guild: Discord.Guild, tag: string, cmd: string, output: string) {
    const timestamp = dateformat(new Date(), 'UTC:HH:MM:ss|yy-mm-dd')
    const logChannel = guild.channels.find('id', Bot.LOG_CHANNEL) as Discord.TextChannel
    logChannel.send(`${tag} ran "${cmd}" at time ${timestamp}: "${output}"`)
  }
}
