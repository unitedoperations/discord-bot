import { Message, Guild } from 'discord.js'
import schedule from 'node-schedule'
import { alertsMessage } from '../messages'

/**
 * Sends a description of the pending alerts that are scheduled
 * @export
 * @async
 * @param {Discord.Guild} _guild
 * @param {Discord.Message} msg
 * @param {string[]} _args
 * @returns {Promise<string>}
 */
export async function alerts(_guild: Guild, msg: Message, _args: string[]): Promise<string> {
  // Get the scheduled alerts
  const jobs: { [job: string]: schedule.Job } = schedule.scheduledJobs
  const alerts: { [name: string]: string[] } = {}

  // Construct object containing alert information
  Object.keys(jobs).forEach(k => {
    const [name, iteration] = jobs[k].name.split('*@*')
    if (!alerts[name]) alerts[name] = []
    alerts[name].push(`${iteration} - ${jobs[k].nextInvocation()}`)
  })

  // Send alert information to author
  await msg.author.send({ embed: alertsMessage(alerts) })
  return 'SCHEDULED_ALERTS_OUTPUT'
}
