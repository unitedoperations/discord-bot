require('dotenv').config()
import { Bot } from './bot'
import { joinGroup, leaveGroup, ratio } from './commands'

// Create new Bot instance and start
const bot = new Bot()
bot.addCommand('join_group', joinGroup)
bot.addCommand('leave_group', leaveGroup)
bot.addCommand('ratio', ratio)
bot.start(process.env.BOT_TOKEN!)
