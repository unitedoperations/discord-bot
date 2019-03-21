/**
 * Static class to hold enviornment variables for easy access
 * @export
 * @class EnvStore
 *
 * @readonly @property {string} BOT_TOKEN
 * @readonly @property {string} GUILD_ID
 * @readonly @property {string} LOG_CHANNEL
 * @readonly @property {string} LFG_CHANNEL
 * @readonly @property {string} REGULARS_CHANNEL
 * @readonly @property {string} ARMA_CHANNEL
 * @readonly @property {string} BMS_CHANNEL
 * @readonly @property {string} MAIN_CHANNEL
 * @readonly @property {string} FLIGHTS_CHANNEL
 * @readonly @property {string} ARMA_PLAYER_ROLE
 * @readonly @property {string} BMS_PLAYER_ROLE
 * @readonly @property {number} NUM_PLAYERS_FOR_ALERT
 * @readonly @property {string[]} ALLOWED_GROUPS
 * @readonly @property {string[]} ADMIN_ROLES
 * @readonly @property {string[]} ALERT_TIMES
 * @readonly @property {number} HOURS_TO_REFRESH_FROM_FORUMS
 * @readonly @property {string} API_BASE
 * @readonly @property {string} API_KEY
 * @readonly @property {string} PUSHER_CLUSTER
 * @readonly @property {string} PUSHER_KEY
 * @readonly @property {string} apiAuthToken
 */
class EnvStore {
  // Static and readonly variables for the Bot class
  public readonly BOT_TOKEN: string = process.env.BOT_TOKEN!
  public readonly GUILD_ID: string = process.env.DISCORD_SERVER_ID!
  public readonly LOG_CHANNEL: string = process.env.DISCORD_LOG_CHANNEL!
  public readonly LFG_CHANNEL: string = process.env.DISCORD_LFG_CHANNEL!
  public readonly REGULARS_CHANNEL: string = process.env.DISCORD_REGULARS_CHANNEL!
  public readonly ARMA_CHANNEL: string = process.env.DISCORD_ARMA_CHANNEL!
  public readonly BMS_CHANNEL: string = process.env.DISCORD_BMS_CHANNEL!
  public readonly MAIN_CHANNEL: string = process.env.DISCORD_MAIN_CHANNEL!
  public readonly FLIGHTS_CHANNEL: string = process.env.DISCORD_FLIGHTS_CHANNEL!
  public readonly ARMA_PLAYER_ROLE: string = process.env.DISCORD_ARMA_PLAYER_ROLE!
  public readonly BMS_PLAYER_ROLE: string = process.env.DISCORD_BMS_PLAYER_ROLE!
  public readonly NUM_PLAYERS_FOR_ALERT: number = parseInt(process.env.NUM_PLAYERS_FOR_ALERT!)
  public readonly ALLOWED_GROUPS: string[] = process.env.DISCORD_ALLOWED_GROUPS!.split(',')
  public readonly ADMIN_ROLES: string[] = process.env.ADMIN_ROLES!.split(',')
  public readonly ALERT_TIMES: string[] = process.env.ALERT_TIMES!.split(',').map(t => t.trim())
  public readonly HOURS_TO_REFRESH_FROM_FORUMS: number = parseInt(
    process.env.HOURS_TO_REFRESH_FROM_FORUMS!
  )
  public readonly API_BASE: string = process.env.API_BASE!
  public readonly API_KEY: string = process.env.API_KEY!
  public readonly PUSHER_CLUSTER: string = process.env.PUSHER_CLUSTER!
  public readonly PUSHER_KEY: string = process.env.PUSHER_KEY!

  get apiAuthToken(): string {
    return `Basic ${Buffer.from(`${this.API_KEY}:`).toString('base64')}`
  }
}

export default new EnvStore()
