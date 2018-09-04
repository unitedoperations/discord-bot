const log = console.log

const tags = {
  info: '[INFO]',
  error: '[ERROR]',
  fav: '[FAV]',
  cmd: '[COMMAND]',
  event: '[EVENT]',
  alert: '[ALERT]'
}

export function info(str: string) {
  log(`${tags.info.padEnd(10)} ${str}`)
}

export function error(str: string) {
  log(`${tags.error.padEnd(10)} ${str}`)
}

export function fav(str: string) {
  log(`${tags.fav.padEnd(10)} ${str}`)
}

export function cmd(str: string) {
  log(`${tags.cmd.padEnd(10)} ${str}`)
}

export function event(str: string) {
  log(`${tags.event.padEnd(10)} ${str}`)
}

export function alert(str: string) {
  log(`${tags.alert.padEnd(10)} ${str}`)
}
