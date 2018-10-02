import { Message, Guild } from 'discord.js'
import { BotAction } from '../../bot'
import { helpMessage } from '../messages'

/**
 * Returns the usage information for the list of commands
 * @export
 * @async
 * @param {Map<string, string>} output
 * @returns {BotAction}
 */
export function help(commands: Map<string, string>): BotAction {
  return async (_guild: Guild, msg: Message, _args: string[]): Promise<string> => {
    await msg.author.send({ embed: helpMessage(commands) })
    return 'HELP_OUTPUT'
  }
}
