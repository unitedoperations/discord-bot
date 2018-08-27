import { Message } from 'discord.js'
import { BotAction } from '../../bot'

/**
 * Returns the usage information for the list of commands
 * @export
 * @async
 * @param {string} output
 * @returns {BotAction}
 */
export function help(output: string): BotAction {
  return async (msg: Message, _args: string[]): Promise<string> => {
    await msg.author.send(output)
    return 'HELP_OUTPUT'
  }
}
