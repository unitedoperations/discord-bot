import { Message, Guild } from 'discord.js'
import { CalendarEvent, EventStore } from '../state'
import { eventsMessage } from '../messages'

/**
 * Displays all pending community events that were scrapped from the forums calendar
 * @export
 * @async
 * @param {Guild} _guild
 * @param {Message} msg
 * @param {string[]} _args
 * @returns {Promise<string>}
 */
export async function events(_guild: Guild, msg: Message, _args: string[]): Promise<string> {
  // Get all stored events send to user with embed message
  const e: CalendarEvent[] = EventStore.getEvents()
  await msg.author.send({ embed: eventsMessage(e) })
  return 'EVENTS_LIST_OUTPUT'
}
