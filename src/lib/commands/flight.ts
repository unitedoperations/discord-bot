import { Message, Guild, TextChannel, RichEmbed } from 'discord.js'
import { GroupStore, Flight, GroupType, EnvStore } from '../state'
import { flightsMessage, flightCreatedMessage } from '../messages'

/**
 * UOAF pickup flight command for creating, joining, and alerting flights
 * and pickup flight members
 * @export
 * @async
 * @param {Guild} guild
 * @param {Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export async function flight(guild: Guild, msg: Message, args: string[]): Promise<string> {
  // List current flights if no arguments given or 'list' argument
  if (args.length === 0 || (args.length === 1 && args[0] === 'list')) {
    return await flightList(msg)
  } else if (args.length === 2 && args[0] === 'join' && !isNaN(parseInt(args[1]))) {
    // Attempt to join a flight if the argued flight ID
    return await flightJoin(msg, args)
  } else if (args.length === 2 && args[0] === 'delete' && !isNaN(parseInt(args[1]))) {
    // Delete the argued flight if the author owns it
    return await flightDelete(msg, args)
  } else if (args.length >= 5 && args[0] === 'create') {
    // Create a new flight
    return await flightCreate(guild, msg, args)
  } else {
    // Invalid inputs
    await msg.author.send('Invalid arguments for the `!flight` command given.')
    return 'INVALID_ARGS'
  }
}

/**
 * Listing all the stored flights
 * @async
 * @param {Message} msg
 * @returns {Promise<string>}
 */
async function flightList(msg: Message): Promise<string> {
  const flights: Flight[] = GroupStore.getFlights()
  await msg.author.send({ embed: flightsMessage(flights) })
  return 'FLIGHT_LISTING_OUTPUT'
}

/**
 * Join a flight with the ID
 * @async
 * @param {Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
async function flightJoin(msg: Message, args: string[]): Promise<string> {
  const { joined, flight } = GroupStore.joinFlight(msg.author, parseInt(args[1]))

  if (joined) {
    // Alert the flight owner and command sender that a new member joined
    await msg.author.send(`You have joined the flight **${flight!.game}-${flight!.id}**.`)
    await flight!.owner.send(
      `_**${msg.author.username}**_ has joined your flight **${flight!.game}-${flight!.id}**.`
    )

    return `FLIGHT_JOIN ${flight!.game}-${flight!.id}`
  } else {
    // No flight found with argued ID
    await msg.author.send(
      `No flight exists with ID: **${
        args[1]
      }**. Run the \`!flight list\` command to see the active flights.`
    )
    return 'GROUP_NOT_FOUND'
  }
}

/**
 * Delete the argued flight ID if the author of the command owns it
 * @param {Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
async function flightDelete(msg: Message, args: string[]): Promise<string> {
  const target: Flight[] = GroupStore.getFlights().filter(f => f.id === parseInt(args[1]))

  if (target.length === 0) {
    // If no flight was found...
    await msg.author.send(`No flight with the ID of ${args[1]} exists.`)
    return 'NO_FLIGHT_TO_DELETE'
  } else if (target[0].owner === msg.author) {
    // Successful find and ownership
    GroupStore.remove(parseInt(args[1]), GroupType.Flight)
    await msg.author.send(`Successfully deleted your flight **${target[0].game}-${target[0].id}**.`)
    return `FLIGHT_REMOVE ${args[1]}`
  } else {
    // Non-ownership error
    await msg.author.send(`You cannot delete a flight that you don't own.`)
    return 'DO_NOT_OWN_FLIGHT'
  }
}

/**
 * Create a new Flight to track and store based on arguments
 * @async
 * @param {Guild} guild
 * @param {Message} msg
 * @param {string[]} args
 * @returns {Promise<string>}
 */
async function flightCreate(guild: Guild, msg: Message, args: string[]): Promise<string> {
  const flights: Flight[] = GroupStore.getFlights()

  // Check if the author already has a registered pickup flight
  if (GroupStore.userAlreadyLooking(msg.author.username, flights)) {
    await msg.author.send('You already have a registered pickup flight!')
    return 'TOO_MANY_FLIGHTS'
  }

  // Ensure that the argued game is valid
  if (args[1].toUpperCase() !== 'BMS' && args[1].toUpperCase() !== 'DCS') {
    await msg.author.send('The `GAME` argument must be either `BMS` or `DCS`.')
    return 'INVALID_ARGS'
  }

  // Get arguments to parse into flight date/time
  const year = new Date().getFullYear()
  const time = args[2]
  const date = args[3].replace('/', '-')

  // Parse input arguments into new Flight object to store
  const f: Flight = {
    id: flights.length + 1,
    owner: msg.author,
    game: args[1].toUpperCase() as 'BMS' | 'DCS',
    details: args.slice(4).join(' '),
    time: new Date(`${year}-${date}T${time}:00Z`),
    found: []
  }

  GroupStore.add(f, GroupType.Flight)
  await msg.author.send(
    `You have created a new **${f.game}** flight! Players can now join using your flight ID: **${
      f.id
    }**.`
  )

  // Send creation announcement to uoaf_flights channel
  const ch: TextChannel = guild.channels.find(c => c.id === EnvStore.FLIGHTS_CHANNEL) as TextChannel
  const role = guild.roles.find(r => r.name === EnvStore.BMS_PLAYER_ROLE)
  await ch.send(role.toString(), { embed: flightCreatedMessage(f) as RichEmbed })

  return `FLIGHT_CREATED: ${f.game}-${f.id}`
}
