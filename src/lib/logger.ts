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
