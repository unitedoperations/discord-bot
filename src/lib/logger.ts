/*
 * Copyright (C) 2020  United Operations
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

enum Tags {
  INFO = '[INFO]',
  ERROR = '[ERROR]',
  SYS = '[SYS]',
  CMD = '[COMMAND]',
  EVENT = '[EVENT]',
  POLL = '[POLL]',
  ALERT = '[ALERT]'
}

function withTimestamp(header: string, str: string) {
  console.log(`${new Date()} ${header.padEnd(10)} ${str}`)
}

export function info(str: string) {
  withTimestamp(Tags.INFO, str)
}

export function error(str: string) {
  withTimestamp(Tags.ERROR, str)
}

export function sys(str: string) {
  withTimestamp(Tags.SYS, str)
}

export function cmd(str: string) {
  withTimestamp(Tags.CMD, str)
}

export function event(str: string) {
  withTimestamp(Tags.EVENT, str)
}

export function poll(str: string) {
  withTimestamp(Tags.POLL, str)
}

export function alert(str: string, iteration: string) {
  withTimestamp(Tags.ALERT, `${str} (${iteration})`)
}
