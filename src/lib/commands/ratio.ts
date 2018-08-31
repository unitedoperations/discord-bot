import { Message, Guild } from 'discord.js'

/**
 * Calculate the player ratio for teams with A:B
 * @export
 * @async
 * @param {Discord.Guild} _guild
 * @param {Discord.Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function ratio(_guild: Guild, msg: Message, args: string[]): Promise<string> {
  const reqArgs = 3

  // Check for the arguments required
  if (args.length != reqArgs) {
    await msg.author.send(`Got ${args.length} inputs instead of ${reqArgs}.`)
    return 'INVALID_ARGS'
  }

  // Gather required values
  const [players, ratioA, ratioB] = args.map(a => parseFloat(a))

  // Calculate the ratio on each side
  const sideA = Math.round((ratioA * players) / (ratioA + ratioB))
  const sideB = players - sideA

  // Send caluclation message
  await msg.author.send(
    `Ratio for ${players} ${ratioA}:${ratioB}\nSide A: ${sideA}\nSide B: ${sideB}`
  )
  return 'RATIO_CALCULATION_RESULTS'
}
