require('dotenv').config()
import { Bot } from './bot'
import { joinGroup, leaveGroup } from './commands'

// Create new Bot instance and start
const bot = new Bot()
bot.addCommand('join_group', joinGroup)
bot.addCommand('leave_group', leaveGroup)
bot.start(process.env.BOT_TOKEN!)
