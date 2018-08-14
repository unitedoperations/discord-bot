require('dotenv').config()
import { Bot } from './bot'
import {
  help,
  polls,
  ratio,
  config,
  primary,
  shutdown,
  joinGroup,
  leaveGroup
} from './lib/commands'

// Create new Bot instance and start
const bot = new Bot()
bot.addCommand('?', help)
bot.addCommand('help', help)
bot.addCommand('polls', polls)
bot.addCommand('ratio', ratio)
bot.addCommand('config', config)
bot.addCommand('primary', primary)
bot.addCommand('shutdown', shutdown)
bot.addCommand('join_group', joinGroup)
bot.addCommand('leave_group', leaveGroup)
bot.start(process.env.BOT_TOKEN!)
