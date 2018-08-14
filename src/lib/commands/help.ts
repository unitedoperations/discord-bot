import { Message } from 'discord.js'

/**
 * Returns the usage information for the list of commands
 * @export
 * @async
 * @param {Message} msg
 * @param {string[]} _args
 * @returns {Promise<string>}
 */
export async function help(msg: Message, _args: string[]): Promise<string> {
  const output = `
  **Commands**
  \`!?\`, \`!help\`: _help for usage on commands_
  \`!config <key> <value>\`: _**(admin only)** re-configure available bot options; check GitHub for list of options_
  \`!join_group <group>\`: _join the argued group if it exists and have permission_
  \`!leave_group <group>\`: _leave the argued group if it exists and you are in it_
  \`!polls\`: _get a list of the active polls/voting threads on the forums_
  \`!primary\`: _get the information about the current mission on the A3 primary_
  \`!ratio <total> <a> <b>\`: _calculate the player ratio for teams with A:B_
  \`!shutdown\`: _**(admin only)** turns off the Discord bot with the correct permissions_
  ---------------------------------------------------------------------------------
  _**All bug reports and feature requests should be submitted through the \`Issues\` system on the GitHub repository:**_
  https://github.com/unitedoperations/uo-discordbot
  `
  await msg.author.send(output)
  return 'HELP_OUTPUT'
}
