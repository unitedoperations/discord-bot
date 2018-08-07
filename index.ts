require('dotenv').config()
import * as Discord from 'discord.js'

const bot: Discord.Client = new Discord.Client()

function welcomeMessage(): object {
  const embed = new Discord.RichEmbed()
    .setTitle('Welcome to United Operations Discord!')
    .setAuthor(bot.user.username, bot.user.avatarURL)
    .setColor('#B19E71')
    .setDescription('Placeholder description...')
    .setURL('forums.unitedoperations.net')
    .addField('General Information', 'http://forums.unitedoperations.net/index.php/page/servers')

  return { embed }
}

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}`)
})

bot.on('message', (msg: Discord.Message) => {
  if (msg.author.tag === bot.user.tag) return

  if (msg.content === 'new_user_test') msg.reply(welcomeMessage())
})

bot.on('guildMemberAdd', (member: Discord.GuildMember) => {
  member.send(welcomeMessage())
})

bot.login(process.env.BOT_TOKEN)
