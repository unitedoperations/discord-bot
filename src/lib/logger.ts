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

const log = console.log

const tags = {
  info: '[INFO]',
  error: '[ERROR]',
  fav: '[FAV]',
  cmd: '[COMMAND]',
  event: '[EVENT]',
  poll: '[POLL]',
  alert: '[ALERT]'
}

function withTimestamp(header: string, str: string) {
  log(`${new Date()} ${header.padEnd(10)} ${str}`)
}

export function info(str: string) {
  withTimestamp(tags.info, str)
}

export function error(str: string) {
  withTimestamp(tags.error, str)
}

export function fav(str: string) {
  withTimestamp(tags.fav, str)
}

export function cmd(str: string) {
  withTimestamp(tags.cmd, str)
}

export function event(str: string) {
  withTimestamp(tags.event, str)
}

export function poll(str: string) {
  withTimestamp(tags.poll, str)
}

export function alert(str: string, iteration: string) {
  withTimestamp(tags.alert, `${str} (${iteration})`)
}
