import Discord from 'discord.js'
import fetch, { RequestInit } from 'node-fetch'
import isFuture from 'date-fns/is_future'
import Pusher from 'pusher-js'
import * as log from './lib/logger'
import { CalendarHandler } from './lib/calendar'
import { PollsHandler, PollThreadResponse } from './lib/polls'
import { Routine, Routinable } from './lib/routine'
import { CalendarEvent, Group, Groups, Routines, Alarms, Env, PollThread } from './lib/state'
import { CommandProvision } from './lib/access'
import { help } from './lib/commands'
import { scrapeServerPage, ServerInformation } from './lib/helpers'
import {
  welcomeMessage,
  reminderMessage,
  serverMessage,
  pollAlertMessage,
  groupsMessage,
  alarmMessage
} from './lib/messages'

/**
 * Type definition for bot action functions
 * @export
 */
export type BotAction = (
  guild: Discord.Guild,
  msg: Discord.Message,
  args: string[]
) => Promise<string>

/**
 * Definition for a generic type that can be T or null
 */
type Nullable<T> = T | null

/**
 * Wrapper class for the Discord SDK and handling custom commands
 * @export
 * @class Bot
 * @implements Routinable
 *
 * @static @property {string} VERSION
 * @static @property {number} REQUEST_COUNT
 * @static @property {number} NEW_MEMBER_MESSAGES_SENT
 *
 * @private @property {Discord.Guild?} _guild
 * @private @property {CalendarHandler} _calendar
 * @private @property {PollsHandler} _polls
 * @private @property {Discord.Client} _client
 * @private @property {Map<string, string>} _descriptions
 * @private @property {Map<string, BotAction>} _commands
 * @private @property {ServerInformation?} _currentMission
 * @private @property {Pusher} _pusherClient
 * @private @property {Pusher.Channel} _subscriber
 */
export class Bot implements Routinable {
  // Public static Bot class variables that are able to be changed via config command
  public static VERSION: string
  public static REQUEST_COUNT: number = 0
  public static NEW_MEMBER_MESSAGES_SENT: number = 0

  // Bot instance variables
  private _guild?: Discord.Guild
  private _calendar: CalendarHandler
  private _polls: PollsHandler
  private _client: Discord.Client
  private _descriptions: Map<string, string> = new Map()
  private _commands: Map<string, BotAction> = new Map()
  private _currentMission?: ServerInformation
  private _pusherClient: Pusher.Pusher
  private _subscriber: Pusher.Channel

  /**
   * Creates an instance of Bot
   * @param {string} version
   * @memberof Bot
   */
  constructor(version: string) {
    Bot.VERSION = version
    this._client = new Discord.Client()
    this._client.on('ready', () => {
      log.fav(`Logged in as ${this._client.user.tag} v${Bot.VERSION}`)
      this._guild = this._client.guilds.find(g => g.id === Env.GUILD_ID)
    })
    this._client.on('message', this._onMessage)
    this._client.on('guildMemberAdd', this._onNewMember)
    this._client.on('error', err => log.error(`CLIENT_ERR ${err.message}`))

    this._calendar = new CalendarHandler(
      `${Env.API_BASE}/calendar/events&sortBy=start&sortDir=desc&hidden=0`,
      this._sendEventReminder.bind(this)
    )

    this._polls = new PollsHandler(
      `${
        Env.API_BASE
      }/forums/topics&forums=132&hidden=0&locked=0&hasPoll=1&sortBy=date&sortDir=desc`,
      this._notifyOfPoll.bind(this)
    )

    this._pusherClient = new Pusher(Env.PUSHER_KEY, {
      cluster: Env.PUSHER_CLUSTER
    })
    this._subscriber = this._pusherClient.subscribe('discord_permissions')
  }

  /**
   * Wrapper function for the Discord client's login function
   * to initialize and start the chat bot in the Discord server
   * @async
   * @param {string} token
   * @memberof Bot
   */
  async start(token: string) {
    // Add final help commands to list
    this._commands.set('?', help(this._descriptions))
    this._commands.set('help', help(this._descriptions))

    try {
      // Login with the Discord client
      await this._client.login(token)

      // Initial calendar feed pull, handled by routine in CalenderHandler instance after
      await this._calendar.update()

      // Initial poll threads pull, handled by routine in PollsHandler instance after
      await this._polls.update()

      // Add a background routines
      // FIXME:
      // Routines.add(
      //   'server',
      //   new Routine<string>(
      //     async url => await this._notifyOfNewMission(url),
      //     ['http://www.unitedoperations.net/tools/uosim'],
      //     5 * 60 * 1000
      //   )
      // )

      Routines.add(
        'groups',
        new Routine<void>(async () => await this._notifyOfActiveGroups(), [], 2 * 60 * 60 * 1000)
      )

      this._subscriber.bind('assign', this._assignUserRoles)
      this._subscriber.bind('revoke', this._removeUserRoles)
    } catch (e) {
      log.error(`START: ${e.message}`)
      process.exit(1)
    }
  }

  /**
   * Ends all routines running on intervals
   * @memberof Bot
   */
  clear() {
    Routines.terminate('server')
    Routines.terminate('groups')
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
   * Performs a scrape of the A3 primary's server information URL argued
   * and if there is an update since the last run, notify to A3 player group
   * @private
   * @async
   * @param {string} url
   * @memberof Bot
   */
  // FIXME:
  // @ts-ignore
  private async _notifyOfNewMission(url: string) {
    try {
      let info: Nullable<ServerInformation> = await scrapeServerPage(url)

      // Set default information if error or none found
      if (!info) {
        info = {
          mission: 'None',
          description: 'Unknown',
          players: '0/64',
          island: 'Unknown',
          author: 'Unknown',
          feedbackURL: ''
        }
      }

      // If the new data is different from previous
      // replace the current data and send the notification
      const players: number = parseInt(info.players.split('/')[0])
      if (
        (!this._currentMission || info.mission !== this._currentMission.mission) &&
        info.mission !== 'None' &&
        players >= Env.NUM_PLAYERS_FOR_ALERT
      ) {
        this._currentMission = info
        const channel = this._guild!.channels.find(
          c => c.id === Env.ARMA_CHANNEL
        ) as Discord.TextChannel
        await channel.send(`_**🎉 NEW MISSION**_`, {
          embed: serverMessage(info) as Discord.RichEmbed
        })
      }

      // Send alarms to users who are registered for the player count or lower
      const userAlarms: Discord.User[] = Alarms.filter(players)
      for (const u of userAlarms) {
        await u.send({ embed: alarmMessage(players) })
        Alarms.remove(u)
      }
    } catch (e) {
      log.error(`NEW_MISSION: ${e.message}`)
    }
  }

  /**
   * Scrapes the voting and discussion page of the forums and alert `@everyone`
   * when there has been a new post or one is closed.
   * @private
   * @async
   * @param {PollThread} poll
   * @param {('open' | 'closed')} status
   * @memberof Bot
   */
  private async _notifyOfPoll(poll: PollThread, status: 'open' | 'closed') {
    try {
      if (status === 'closed') {
        // Fetch the final voting results to append to
        // the poll object before passing to be alerted
        const opts: RequestInit = {
          headers: {
            Authorization: Env.apiAuthToken
          }
        }
        const res = await fetch(`${Env.API_BASE}/forums/topics/${poll.id}`, opts)
        const thread: PollThreadResponse = await res.json()
        poll.votes = {
          Yes: thread.poll.questions[0].options.Yes,
          No: thread.poll.questions[0].options.No
        }
      }

      // Send message for all closed polls and all opened polls
      const channel = this._guild!.channels.find(
        c => c.id === Env.REGULARS_CHANNEL
      ) as Discord.TextChannel

      await channel.send({
        embed: pollAlertMessage(poll, status)
      })
    } catch (e) {
      log.error(`POLL_ALERT: ${e.message}`)
    }
  }

  /**
   * Gets the active LFG groups and notifies the designated channel
   * @private
   * @async
   * @memberof Bot
   */
  private async _notifyOfActiveGroups() {
    const groups: Group[] = Groups.getGroups()
    try {
      // Notify the LFG channel if there are any active groups
      if (groups.length > 0) {
        const chan = this._guild!.channels.find(
          c => c.id === Env.LFG_CHANNEL
        ) as Discord.TextChannel
        await chan.send({ embed: groupsMessage(groups) })
      }
    } catch (e) {
      log.error(`LFG_ALERT: ${e.message}`)
    }
  }

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
      log.alert(`Sending notification for event: ${e.title}`, reminder)

      // Ensure it won't send this same reminder type again
      e.reminders.set(reminder, true)

      // If hour difference is within the remind window, send message to
      // all users of the designated group with the reminder in the main channel
      const msg = reminderMessage(e, reminder) as Discord.RichEmbed

      try {
        // Determine the channel that the message should be send to and who to tag
        let channel: Discord.TextChannel
        let role: Nullable<Discord.Role>
        switch (e.group) {
          // ArmA 3 event reminder
          case 'UOA3':
            role = this._guild!.roles.find(r => r.name === Env.ARMA_PLAYER_ROLE)
            channel = this._guild!.channels.find(
              c => c.id === Env.ARMA_CHANNEL
            ) as Discord.TextChannel
            break
          // BMS event reminder
          case 'UOAF':
            role = this._guild!.roles.find(r => r.name === Env.BMS_PLAYER_ROLE)
            channel = this._guild!.channels.find(
              c => c.id === Env.BMS_CHANNEL
            ) as Discord.TextChannel
            break
          // UOTC course reminder
          case 'UOTC':
            role = null
            channel = this._guild!.channels.find(
              c => c.id === Env.ARMA_CHANNEL
            ) as Discord.TextChannel
            break
          // Unknown event type reminder
          default:
            role = null
            channel = this._guild!.channels.find(
              c => c.id === Env.MAIN_CHANNEL
            ) as Discord.TextChannel
        }

        // Dispatch event reminder to correct group and channel
        await channel.send(role ? role.toString() : '', { embed: msg })
      } catch (e) {
        log.error(`EVENT ${e.name}: ${e.message}`)
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
    Bot.NEW_MEMBER_MESSAGES_SENT++
    const username: string = member.user.username
    try {
      await member.send({ embed: welcomeMessage(username) })
    } catch (e) {
      log.error(`NEW_USER ${username}: ${e.message}`)
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
    if (msg.author.bot) return

    // Get the command and its arguments from received message
    const [cmd, ...args] = msg.content.split(' ')
    const cmdKey = cmd.slice(1)

    // Check if the message actually is a command (starts with '!')
    if (cmd.startsWith('!')) {
      Bot.REQUEST_COUNT++

      // Look for a handler function is the map that matches the command
      const fn = this._commands.get(cmdKey)
      if (fn) {
        // Get the origin of the message, DM or guild
        const origin: string = msg.guild ? 'GLD' : 'PM'

        try {
          // Delete the original command, run the handler and log the response
          if (origin === 'GLD') await msg.delete()

          const output = await fn(msg.guild || this._guild, msg, args)
          await this._log(msg.author.tag, [cmd, ...args].join(' '), output)
          log.cmd(`(${origin})(${msg.author.username} - ${cmd}) - ${output}`)

          if (cmd === '!shutdown' && output === 'shutdown successful') process.exit(0)
        } catch (e) {
          log.error(`COMMAND (${origin})(${msg.author.username} - ${cmd}) : ${e}`)
        }
      } else {
        try {
          await msg.delete()
          await msg.author.send(`Sorry, I wasn't taught how to handle \`${cmd}\`. 🙁`)
          log.error(`NO_COMMAND (${msg.author.username}) - ${cmd}`)
        } catch (e) {
          log.error('MESSAGE_DELETE')
        }
      }
    }
  }

  /**
   * Handles the Pusher.js 'assign' event from the channel subscription and
   * uses the payload's user ID and roles list to assign the appropriate user
   * the roles on the Discord server they should belong to
   * @private
   * @param {{ id: string, roles: string[] }} payload
   * @memberof Bot
   */
  private _assignUserRoles = (payload: { id: string; roles: string[] }) => {
    try {
      const member: Nullable<Discord.GuildMember> = this._guild!.members.find(
        m => m.user.id === payload.id
      )

      if (member) {
        const rolesToAdd: Discord.Role[] = []
        for (const role of payload.roles) {
          const guildRole: Nullable<Discord.Role> = this._guild!.roles.find(r => r.name === role)
          if (guildRole) rolesToAdd.push(guildRole)
        }
        member.addRoles(rolesToAdd, 'Provision Task via UO Authenticator')
      }

      this._log(
        'United Operations',
        'AUTH_PROVISIONING',
        `${member.user.username} -> ${payload.roles}`
      )
    } catch (err) {
      log.error('AUTH_PROVISIONING_FAILURE')
      this._log('United Operations', 'AUTH_PROVISIONING', `FAILED: ${payload.id}`)
    }
  }

  /**
   * Handles the Pusher.js 'revoke' event from the channel subscription and
   * uses the payload's user ID to remove all roles from the argued user
   * if found in the Discord server
   * @private
   * @param {{ id: string }} payload
   * @memberof Bot
   */
  private _removeUserRoles = (payload: { id: string }) => {
    try {
      const member: Nullable<Discord.GuildMember> = this._guild!.members.find(
        m => m.user.id === payload.id
      )

      if (member) {
        member.removeRoles(member.roles)
      }

      this._log('United Operations', 'AUTH_REVOKE', member.user.username)
    } catch (err) {
      log.error('AUTH_REVOKE_FAILURE')
      this._log('United Operations', 'AUTH_REVOKE', `FAILED: ${payload.id}`)
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
  private _log(tag: string, cmd: string, output: string): Promise<any> | void {
    try {
      const timestamp = new Date().toISOString()
      const logChannel = this._guild!.channels.find(
        c => c.id === Env.LOG_CHANNEL
      ) as Discord.TextChannel
      return logChannel.send(`${tag} ran "${cmd.replace('@&', '')}" at ${timestamp}: "${output}"`)
    } catch (e) {
      log.error('FAILED_LOG')
      return
    }
  }
}
