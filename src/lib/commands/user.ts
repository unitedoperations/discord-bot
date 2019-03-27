import { Message, Guild } from 'discord.js'
import fetch, { RequestInit } from 'node-fetch'
import { Env } from '../state'
import { authenticatedUserMessage } from '../messages'

export type UserEntity = {
  username: string
  email: string
  forums_id: number
  discord_id: string
  teamspeak_id: string
  teamspeak_db_id: number
  ip: string
  createdAt: string
}

/**
 * Pulls information about the argued user from the UO Authentication API
 * @export
 * @async
 * @param {Discord.Guild} _guild
 * @param {Discord.Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function user(_guild: Guild, msg: Message, args: string[]): Promise<string> {
  // Ensure there was at least one name argued given
  if (args.length < 1) {
    await msg.author.send('You must provide the username of the user you are searching for.')
    return 'INVALID_ARGS'
  }

  // Log into the mission file FTP server and get the list of all mission on the primary server
  const opts: RequestInit = { headers: { 'X-API-Key': Env.AUTH_API_KEY } }
  const response = await fetch(`${Env.AUTH_API_BASE}/user?username=${args[0]}`, opts)

  // JSON respsonse will contain an error if the user could not be found, otherwise the user object
  const resJson: { user?: UserEntity; error?: string } = await response.json()

  if (resJson.error) {
    await msg.author.send(`${args[0]} does not match any authenticated users in the system.`)
    return 'USER_NOT_FOUND'
  }

  await msg.author.send({ embed: authenticatedUserMessage(resJson.user!) })
  return 'MISSION_SEARCH_OUTPUT'
}
