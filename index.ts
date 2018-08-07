require('dotenv').config()
import * as Discord from 'discord.js'
import FeedParser from 'feedparser'
import request from 'request'

// Custom interfaces
interface CalendarEvent {
  guid: string
  title: string
  date: Date | null
  link: string
  img: string | null
}

interface EmbedMessageImage {
  url: string | null
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
  thumbnail?: EmbedMessageImage
  image?: EmbedMessageImage
  fields?: EmbedMessageField[]
}

/**
 * Compiles the JSON object for the new users' welcome message
 * @returns {EmbedMessage}
 */
const welcomeMessage = (name: string): EmbedMessage => ({
  color: 11640433, // Integer representation of UO color #B19E71
  title: `**Welcome to United Operations Discord, ${name}!**`, // Bolded with markdown
  url: 'http://forums.unitedoperations.net',
  description: '*Placeholder description...*', // Italisized with markdown TODO: insert descr
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

/**
 * Compiles the JSON object for an embed calendar event message
 * to remind everyone is the Discord server of the upcoming event
 * @param event {CalendarEvent}
 * @returns {EmbedMessage}
 */
const eventMessage = (event: CalendarEvent): EmbedMessage => ({
  color: 11640433,
  title: `**Reminder:** *${event.title}*`, // Styled with markdown
  url: event.link,
  description: '*Placeholder description...*', // TODO: Insert description of event
  image: {
    url: event.img
  }
})

/**
 * Uses a regular expression to parse and find the header image for the
 * RSS event's summary that is being passed in
 * @param html {string}
 * @returns {string | null}
 */
function getEventImage(html: string): string | null {
  const exp: RegExp = /<img\sclass='bbc_img'\ssrc='(.*)'\salt=.*\/>/g
  const match = exp.exec(html)
  if (match) return match[1]
  return null
}

// Create new Discord bot client and RSS feed parser
let eventStore: CalendarEvent[] = []
const bot: Discord.Client = new Discord.Client()
const rss: FeedParser = new FeedParser({
  feedurl: 'http://forums.unitedoperations.net/index.php/rss/calendar/1-community-calendar/'
})

const req = request(
  'http://forums.unitedoperations.net/index.php/rss/calendar/1-community-calendar/'
)

req.on('error', err => {
  console.log(err.message)
})

req.on('response', (res: request.Response) => {
  req.pipe(rss)
})

rss.on('readable', () => {
  const events: CalendarEvent[] = []
  let e: FeedParser.Item
  while ((e = rss.read())) {
    const imgUrl: string | null = getEventImage(e.summary)
    events.push({
      guid: e.guid,
      title: e.title,
      date: e.date,
      link: e.link,
      img: imgUrl
    })
  }

  if (events.length > 0) eventStore = events
})

/**
 * Handler for when the Bot successfully logs into its account
 * on the Discord server and is ready to handle interactions
 * @event ready
 */
bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}`)
})

/**
 * Handler for incoming messages for the bot to interact with
 * @event message
 */
bot.on('message', (msg: Discord.Message) => {
  if (msg.author.tag === bot.user.tag) return

  if (msg.content === 'new_user_test')
    msg.channel.send({ embed: welcomeMessage(msg.author.username) })

  if (msg.content === 'test_events') {
    const guild = bot.guilds.find('name', 'Devscord')
    const c = guild.channels.find('id', '415534130227445762') as Discord.TextChannel
    c.send(`@everyone`, { embed: eventMessage(eventStore[0]) as Discord.RichEmbed })
  }
})

/**
 * Handler for when a new member joins the guild (server)
 * @event guildMemberAdd
 */
bot.on('guildMemberAdd', (member: Discord.GuildMember) => {
  member.send({ embed: welcomeMessage(member.user.username) })
})

// Initial bot connection to the Discord server
bot.login(process.env.BOT_TOKEN)
