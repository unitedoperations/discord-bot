require('dotenv').config()
import * as Discord from 'discord.js'

const bot: Discord.Client = new Discord.Client()

interface EmbedMessageImage {
  url: string
}

interface EmbedMessageField {
  name: string
  value: string
}

interface EmbedMessage {
  color: number
  title: string
  url: string
  description: string
  thumbnail: EmbedMessageImage
  image: EmbedMessageImage
  fields: EmbedMessageField[]
}

const welcomeMessage = (): EmbedMessage => ({
  color: 11640433, // Integer representation of UO color #B19E71
  title: '**Welcome to United Operations Discord!**', // Bolded with markdown
  url: 'http://forums.unitedoperations.net',
  description: '*Placeholder description...*', // Italisized with markdown
  thumbnail: {
    url: 'https://units.arma3.com/groups/img/1222/vSClUszph6.png'
  },
  image: {
    url:
      'http://forums.unitedoperations.net/public/style_images/United_Operations___Animated/scooby_banner_bg.png'
  },
  fields: [
    {
      name: 'Server Information',
      value: 'http://forums.unitedoperations.net/index.php/page/servers'
    },
    {
      name: 'Charter',
      value: 'http://www.unitedoperations.net/wiki/United_Operations_Charter'
    }
  ]
})

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}`)
})

bot.on('message', (msg: Discord.Message) => {
  if (msg.author.tag === bot.user.tag) return

  if (msg.content === 'new_user_test') msg.channel.send({ embed: welcomeMessage() })
})

bot.on('guildMemberAdd', (member: Discord.GuildMember) => {
  member.send({ embed: welcomeMessage() })
})

bot.login(process.env.BOT_TOKEN)
