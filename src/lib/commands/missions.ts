import { Message, Guild } from 'discord.js'
import FTP from 'promise-ftp'
import { missionsMessage } from '../messages'

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
  const { FTP_HOST, FTP_USER, FTP_PASS } = process.env
  const ftp = new FTP()
  await ftp.connect({ host: FTP_HOST, user: FTP_USER, password: FTP_PASS })
  const files: FTP.ListingElement[] = await ftp.list('/SRV1')
  await ftp.end()

  // Filter all the missions that match or are similar to the argued values
  const matches: string[] = files.map(f => f.name).filter(n => isMatch(args, n.split('_')))

  await msg.author.send({ embed: missionsMessage(args, matches) })
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
