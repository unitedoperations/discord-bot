/*
 * Copyright (C) 2019  United Operations
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Message, Guild } from 'discord.js'
import { CalendarEvent, Events } from '../state'
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
  const e: CalendarEvent[] = Events.getEvents()
  await msg.author.send({ embed: eventsMessage(e) })
  return 'EVENTS_LIST_OUTPUT'
}
