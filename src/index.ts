require('dotenv').config()
import { Bot } from './bot'

// Create new Bot instance and start
const bot = new Bot()
bot.start(process.env.BOT_TOKEN!)
