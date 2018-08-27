import Discord from 'discord.js'
import signale from 'signale'
import isFuture from 'date-fns/is_future'
import { CalendarFeed, CalendarEvent } from './calendar'
import { welcomeMessage, eventMessage, serverMessage, pollsMessage } from './lib/messages'
import { CommandProvision } from './lib/access'
import { help } from './lib/commands'
import {
  arrayDiff,
  scrapeServerPage,
  scrapeThreadsPage,
  ServerInformation,
  ThreadInformation
} from './lib/helpers'
import { Routine, Routinable } from './routine'

/**
 * Type definition for bot action functions
 * @export
 */
export type BotAction = (msg: Discord.Message, args: string[]) => Promise<string>

/**
 * Wrapper class for the Discord SDK and handling custom commands
 * @export
 * @class Bot
 * @implements Routinable
 * @property {string} GUILD_NAME
 * @property {string} LOG_CHANNEL
 * @property {string} MAIN_CHANNEL
 * @property {string} REGULARS_CHANNEL
 * @property {string} ARMA_CHANNEL
 * @property {string} BMS_CHANNEL
 * @property {string} ARMA_PLAYER_ROLE
 * @property {string} BMS_PLAYER_ROLE
 * @property {number} MIN_PLAYERS_ALERT
 * @property {Discord.Guild?} _guild
 * @property {CalendarFeed} _calendar
 * @property {Discord.Client} _client
 * @property {Map<string, string>} _descriptions
 * @property {Map<string, BotAction>} _commands
 * @property {Routine<void>?} _calendarRoutine
 * @property {Routine<string>?} _serverRoutine
 * @property {Routine<string>?} _pollsRoutine
 * @property {ServerInformation?} _currentMission
 */
export class Bot implements Routinable {
  // Static and readonly variables for the Bot class
  private static readonly GUILD_ID: string = process.env.DISCORD_SERVER_ID!
  private static readonly LOG_CHANNEL: string = process.env.DISCORD_LOG_CHANNEL!
  private static readonly MAIN_CHANNEL: string = process.env.DISCORD_MAIN_CHANNEL!
  private static readonly REGULARS_CHANNEL: string = process.env.DISCORD_REGULARS_CHANNEL!
  private static readonly ARMA_CHANNEL: string = process.env.DISCORD_ARMA_CHANNEL!
  private static readonly BMS_CHANNEL: string = process.env.DISCORD_BMS_CHANNEL!

  // Public static Bot class variables that are able to be changed via config command
  public static ARMA_PLAYER_ROLE: string = process.env.DISCORD_ARMA_PLAYER_ROLE!
  public static BMS_PLAYER_ROLE: string = process.env.DISCORD_BMS_PLAYER_ROLE!
  public static NUM_PLAYERS_FOR_ALERT: number = parseInt(process.env.NUM_PLAYERS_FOR_ALERT!)

  // Bot instance variables
  private _guild?: Discord.Guild
  private _calendar: CalendarFeed
  private _client: Discord.Client
  private _descriptions: Map<string, string> = new Map()
  private _commands: Map<string, BotAction> = new Map()
  // private _calendarRoutine?: Routine<void>
  private _serverRoutine?: Routine<string>
  private _pollsRoutine?: Routine<string>
  private _currentMission?: ServerInformation
  private _activePolls: ThreadInformation[] = []

  /**
   * Creates an instance of Bot
   * @memberof Bot
   */
  constructor() {
    this._client = new Discord.Client()
    this._client.on('ready', () => {
      signale.fav(`Logged in as ${this._client.user.tag}`)
      this._guild = this._client.guilds.find(g => g.id === Bot.GUILD_ID)
    })
    this._client.on('message', this._onMessage)
    this._client.on('guildMemberAdd', this._onNewMember)

    this._calendar = new CalendarFeed(
      'http://forums.unitedoperations.net/index.php/rss/calendar/1-community-calendar/',
      this._sendEventReminder
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
    try {
      // Initial calendar feed pull, handled by routine in CalendarFeed instance after
      await this._calendar.pull()

      // Create a new routine to check for notifications on events on an interval
      // this._calendarRoutine = new Routine<void>(
      //   async () => await this._notifyOfEvents(),
      //   [],
      //   1 * 60 * 1000 // Minutes to millisecond
      // )

      // Create a new routine to check for new missions being loaded on A3 server
      this._serverRoutine = new Routine<string>(
        async url => await this._notifyOfNewMission(url),
        ['http://www.unitedoperations.net/tools/uosim/'],
        5 * 60 * 1000
      )

      // Creates a new routine to check the forums voting and polls section and alert on new posts
      this._pollsRoutine = new Routine<string>(
        async url => await this._notifyOfNewPoll(url),
        ['http://forums.unitedoperations.net/index.php/forum/132-policy-voting-discussions/'],
        12 * 60 * 60 * 1000
      )
    } catch (e) {
      signale.error(`START: ${e.message}`)
    }

    // Login with the Discord client
    return this._client.login(token)
  }

  /**
   * Ends all routines running on intervals
   * @memberof Bot
   */
  clear() {
    // ;(this._calendarRoutine as Routine<any>).terminate()
    ;(this._serverRoutine as Routine<any>).terminate()
    ;(this._pollsRoutine as Routine<any>).terminate()
  }

  /**
   * Adds a new command action to the map under a key
   * that is the command string for application to the
   * _onMessage handler at start
   * @param {string} cmd
   * @param {string} desc
   * @param {(Bot, Discord.Message, string[]) => Promise<string>} action
   * @param {CommandProvision?} provision
   * @returns {Bot}
   * @memberof Bot
   */
  addCommand(cmd: string, desc: string, action: BotAction, provision?: CommandProvision): Bot {
    this._commands.set(cmd, provision ? provision(action) : action)
    if (provision) desc += ` _**(${provision.name})**_`
    this._descriptions.set(cmd, desc)
    return this
  }

  /**
   * Takes the descriptions of all commands added and dynamically builds
   * the help command output and completes the command adding process
   * @returns {Bot}
   * @memberof Bot
   */
  compileCommands(): Bot {
    const helpOutput: string = [
      '**Commands**',
      '`!?`: _help for usage on commands_',
      ...this._descriptions.values(),
      '---------------------------------------------------------------------------------',
      '_**All bug reports and feature requests should be submitted through the `Issues` system on the GitHub repository:**_',
      'https://github.com/unitedoperations/uo-discordbot'
    ].join('\n')

    this._commands.set('?', help(helpOutput))
    return this
  }

  /**
   * Performs a scrape of the A3 primary's server information URL argued
   * and if there is an update since the last run, notify to A3 player group
   * @private
   * @async
   * @param {string} url
   * @memberof Bot
   */
  private async _notifyOfNewMission(url: string) {
    try {
      let info: ServerInformation | null = await scrapeServerPage(url)

      // Set default information if error or none found
      if (!info) {
        info = {
          mission: 'None',
          description: 'Unknown',
          players: '0/64',
          island: 'Unknown',
          author: 'Unknown'
        }
      }

      // If the new data is different from previous
      // replace the current data and send the notification
      const players: number = parseInt(info.players.split('/')[0])
      if (
        (!this._currentMission || info.mission !== this._currentMission.mission) &&
        info.mission !== 'None' &&
        players >= Bot.NUM_PLAYERS_FOR_ALERT
      ) {
        this._currentMission = info
        const msg = serverMessage(info) as Discord.RichEmbed
        const channel = this._guild!.channels.find(
          c => c.id === Bot.ARMA_CHANNEL
        ) as Discord.TextChannel
        await channel.send(`_**NEW MISSION 🎉**_`, { embed: msg })
      }
    } catch (e) {
      signale.error(`NEW_MISSION: ${e.message}`)
    }
  }

  /**
   * Scrapes the voting and discussion page of the forums and alert `@everyone`
   * when there has been a new post or one is closed.
   * @private
   * @async
   * @param {string} url
   * @memberof Bot
   */
  private async _notifyOfNewPoll(url: string) {
    try {
      // Scrape the thread url and get information from the list of posts
      const polls: ThreadInformation[] = await scrapeThreadsPage(url)

      // Get removed (closed) and additions (opened) polls
      const closed: ThreadInformation[] = arrayDiff<ThreadInformation>(this._activePolls, polls)
      const opened: ThreadInformation[] = arrayDiff<ThreadInformation>(polls, this._activePolls)

      // If there are no opened or closed polls since last check, exit
      if (closed.length === 0 && opened.length === 0) return

      // Set new values for active polls
      this._activePolls = polls

      // Send message for all closed polls and all opened polls
      const channel = this._guild!.channels.find(
        c => c.id === Bot.REGULARS_CHANNEL
      ) as Discord.TextChannel

      // Opened polls message
      if (opened.length > 0) {
        await channel.send(`@everyone`, {
          embed: pollsMessage(opened, 'open') as Discord.RichEmbed
        })
      }

      // Closed polls message
      if (closed.length > 0) {
        await channel.send(`@everyone`, {
          embed: pollsMessage(closed, 'close') as Discord.RichEmbed
        })
      }
    } catch (e) {
      signale.error(`NEW_POLL: ${e.message}`)
    }
  }

  /**
   * Pulls updates from the RSS event feed and send reminds if necessary
   * after comparing the start time of the event and the current time
   * @private
   * @async
   * @memberof Bot
   */
  // UNHIDE:WARNING:
  // private async _notifyOfEvents() {
  //   this._calendar.events.forEach(async e => {
  //     // Make sure the event hasn't already happened
  //     if (isFuture(e.date)) {
  //       // Get the time difference between now and the event date
  //       const timeDiff = distanceInWordsToNow(e.date)

  //       // Check if the time difference matches a configured time reminder
  //       const match: string = reminderIntervals.filter(r => timeDistanceMatch(r, timeDiff))[0] || ''
  //       if (match !== '' && !e.reminders.get(match)) {
  //         signale.star(`Sending notification for event: ${e.title}`)

  //         // Ensure it won't send this same reminder type again
  //         e.reminders.set(match, true)

  //         // If hour difference is within the remind window, send message to
  //         // all users of the designated group with the reminder in the main channel
  //         const msg = eventMessage(e, timeDiff) as Discord.RichEmbed

  //         try {
  //           // Determine the channel that the message should be send to and who to tag
  //           let channel: Discord.TextChannel
  //           let role: Discord.Role | null
  //           switch (e.group) {
  //             // ArmA 3 event reminder
  //             case 'UOA3':
  //               role = this._guild!.roles.find(r => r.name === Bot.ARMA_PLAYER_ROLE)
  //               channel = this._guild!.channels.find(
  //                 c => c.id === Bot.ARMA_CHANNEL
  //               ) as Discord.TextChannel
  //               break
  //             // BMS event reminder
  //             case 'UOAF':
  //               role = this._guild!.roles.find(r => r.name === Bot.BMS_PLAYER_ROLE)
  //               channel = this._guild!.channels.find(
  //                 c => c.id === Bot.BMS_CHANNEL
  //               ) as Discord.TextChannel
  //               break
  //             // UOTC course reminder
  //             case 'UOTC':
  //               role = null
  //               channel = this._guild!.channels.find(
  //                 c => c.id === Bot.ARMA_CHANNEL
  //               ) as Discord.TextChannel
  //               break
  //             // Unknown event type reminder
  //             default:
  //               role = null
  //               channel = this._guild!.channels.find(
  //                 c => c.id === Bot.MAIN_CHANNEL
  //               ) as Discord.TextChannel
  //           }

  //           // Dispatch event reminder to correct group and channel
  //           await channel.send(role ? role.toString() : '', { embed: msg })
  //         } catch (e) {
  //           signale.error(`EVENT ${e.name}: ${e.message}`)
  //         }
  //       }
  //     }
  //   })
  // }

  /**
   * Pulls updates from the RSS event feed and send reminds if necessary
   * after comparing the start time of the event and the current time
   * @private
   * @async
   * @memberof Bot
   */
  private async _sendEventReminder(reminder: string, e: CalendarEvent) {
    // Make sure the event hasn't already happened
    if (isFuture(e.date) && !e.reminders.get(reminder)) {
      signale.star(`Sending notification for event: ${e.title}`)

      // Ensure it won't send this same reminder type again
      e.reminders.set(reminder, true)

      // If hour difference is within the remind window, send message to
      // all users of the designated group with the reminder in the main channel
      const msg = eventMessage(e, reminder) as Discord.RichEmbed

      try {
        // Determine the channel that the message should be send to and who to tag
        let channel: Discord.TextChannel
        let role: Discord.Role | null
        switch (e.group) {
          // ArmA 3 event reminder
          case 'UOA3':
            role = this._guild!.roles.find(r => r.name === Bot.ARMA_PLAYER_ROLE)
            channel = this._guild!.channels.find(
              c => c.id === Bot.ARMA_CHANNEL
            ) as Discord.TextChannel
            break
          // BMS event reminder
          case 'UOAF':
            role = this._guild!.roles.find(r => r.name === Bot.BMS_PLAYER_ROLE)
            channel = this._guild!.channels.find(
              c => c.id === Bot.BMS_CHANNEL
            ) as Discord.TextChannel
            break
          // UOTC course reminder
          case 'UOTC':
            role = null
            channel = this._guild!.channels.find(
              c => c.id === Bot.ARMA_CHANNEL
            ) as Discord.TextChannel
            break
          // Unknown event type reminder
          default:
            role = null
            channel = this._guild!.channels.find(
              c => c.id === Bot.MAIN_CHANNEL
            ) as Discord.TextChannel
        }

        // Dispatch event reminder to correct group and channel
        await channel.send(role ? role.toString() : '', { embed: msg })
      } catch (e) {
        signale.error(`EVENT ${e.name}: ${e.message}`)
      }
    }
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
  private _onNewMember = async (member: Discord.GuildMember) => {
    const username: string = member.user.username
    try {
      await member.send({ embed: welcomeMessage(username) })
    } catch (e) {
      signale.error(`NEW_USER ${username}: ${e.message}`)
    }
  }

  /**
   * Handler for when a new message is received to the bot
   * and it determines the current way to react based on the
   * command found. If the message it determined now to be a valid
   * command or was a message create by the bot, nothing happens
   * @private
   * @async
   * @param {Discord.Message} msg
   * @memberof Bot
   */
  private _onMessage = async (msg: Discord.Message) => {
    // Skip message if came from bot
    if (msg.author.bot || !msg.guild) return

    // Get the command and its arguments from received message
    const [cmd, ...args] = msg.content.split(' ')
    const cmdKey = cmd.slice(1)

    // Check if the message actually is a command (starts with '!')
    if (cmd.startsWith('!')) {
      // Look for a handler function is the map that matches the command
      const fn = this._commands.get(cmdKey)
      if (fn) {
        try {
          // Delete the original command, run the handler and log the response
          await msg.delete()

          const output = await fn(msg, args)
          await this._log(msg.author.tag, [cmd, ...args].join(' '), output)

          if (cmd === '!shutdown' && output === 'shutdown successful') process.exit(0)
        } catch (e) {
          signale.error(`COMMAND (${cmd}) : ${e}`)
        }
      } else {
        await msg.delete()
        signale.error(`No command function found for '!${cmdKey}'`)
      }
    }
  }

  /**
   * Logs all commands run through the bot to the designated logging
   * channel on the Discord server with the essential date and timestamp
   * @private
   * @async
   * @param {string} tag
   * @param {string} cmd
   * @param {string} output
   * @returns {Promise<any>}
   * @memberof Bot
   */
  private _log(tag: string, cmd: string, output: string): Promise<any> {
    const timestamp = new Date().toISOString()
    const logChannel = this._guild!.channels.find(
      c => c.id === Bot.LOG_CHANNEL
    ) as Discord.TextChannel
    return logChannel.send(`${tag} ran "${cmd.replace('@&', '')}" at ${timestamp}: "${output}"`)
  }
}
