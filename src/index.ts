require('dotenv').config()
import { Bot } from './bot'
import { help, ratio, primary, joinGroup, leaveGroup } from './commands'

// Create new Bot instance and start
const bot = new Bot()
bot.addCommand('?', help)
bot.addCommand('help', help)
bot.addCommand('ratio', ratio)
bot.addCommand('primary', primary)
bot.addCommand('join_group', joinGroup)
bot.addCommand('leave_group', leaveGroup)
bot.start(process.env.BOT_TOKEN!)
