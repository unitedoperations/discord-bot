import { Message, Guild } from 'discord.js'
import fetch, { RequestInit } from 'node-fetch'
import { Env } from '../state'
import { missionsMessage } from '../messages'

type MissionCategory = {
  id: number
  name: string
  url: string
}

type MissionAuthor = {
  id: number
  name: string
  email: string
}

type ArmAMission = {
  id: number
  title: string
  category: MissionCategory
  fields: Record<string, string>
  author: MissionAuthor
  date: string
  description: string
  comments: number
  reviews: number
  views: number
  url: string
  rating: number
}

enum MissionField {
  PlayerCount = 'field_40',
  JIPType = 'field_41',
  GameMode = 'field_43',
  Island = 'field_44',
  FileName = 'field_48',
  Description = 'field_49'
}

/**
 * Searches the mission file FTP server for names that match the argued name
 * @export
 * @async
 * @param {Discord.Guild} _guild
 * @param {Discord.Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function missions(_guild: Guild, msg: Message, args: string[]): Promise<string> {
  // Ensure there was at least one name argued given
  if (args.length < 1) {
    await msg.author.send('You must provide at least one string for searching mission names.')
    return 'INVALID_ARGS'
  }

  // Log into the mission file FTP server and get the list of all mission on the primary server
  const opts: RequestInit = { headers: { Authorization: Env.apiAuthToken } }
  const params: string = '&categories=41&sortBy=title&sortDir=asc'
  const response = await fetch(`${Env.API_BASE}/cms/records/7${params}`, opts)
  const liveMissionList: ArmAMission[] = await response.json().then(x => x.results)

  // Filter all the missions that match or are similar to the argued values
  const matchesByName: string[] = liveMissionList
    .map(mission => mission.fields[MissionField.FileName])
    .filter(n => isMatch(args, n.split('_')))

  await msg.author.send({ embed: missionsMessage(args, matchesByName) })
  return 'MISSION_SEARCH_OUTPUT'
}

/**
 * Determines whether the name components of the test strings are a close
 * enough match to the components of the actual file name to be included in results
 * @param {string[]} testName
 * @param {string[]} fileName
 * @returns {boolean}
 */
function isMatch(testName: string[], fileName: string[]): boolean {
  const fileNameLower: string[] = fileName.map(str => str.toLowerCase())
  return testName.every(str => fileNameLower.includes(str.toLowerCase()))
}
