import controller from '../controller'
import jira from '../jira'

const formatIssue = (key) => `[${key}](${jira.linkToIssue({ key })})`

export const handleWatchTicket = async (bot, message) => {
  const key = message.match[message.match.length - 1].toUpperCase()
  let ticket = await controller.storage.tickets.get(key)
  if (!ticket) {
    ticket = {
      id: key,
      rooms: []
    }
  }
  ticket.rooms = Array.from(new Set([...ticket.rooms, message.channel]))
  await controller.storage.tickets.save(ticket)

  bot.reply(message, `Ok, I will notify you of changes to **${formatIssue(key)}** in this room`)
}

export const handleUnwatchTicket = async (bot, message) => {
  const key = message.match[message.match.length - 1].toUpperCase()
  const ticket = await controller.storage.tickets.get(key)
  if (ticket) {
    ticket.rooms = ticket.rooms.filter(room => room !== message.channel)
    await controller.storage.tickets.save(ticket)
  }
  bot.reply(message, `Ok, I will no longer notify you of changes to **${formatIssue(key)}** in this room`)
}

export const handleListWatch = async (bot, message) => {
  if (process.env.JIRA_WEBHOOK_ROOM === message.channel) {
    bot.reply(message, `I will post updates to any tickets that I receive to this channel.`)
    return
  }
  const tickets = await controller.storage.tickets.all()
  const watchedTickets = tickets.length ? tickets.filter(ticket => ticket.rooms.includes(message.channel)) : []
  if (watchedTickets.length) {
    const watchedStr = watchedTickets.map(ticket => `* **${formatIssue(ticket.id)}**`).sort().join('\n')
    bot.reply(message, `I'm watching the following tickets and will post updates to this room: \n${watchedStr}`)
  } else {
    bot.reply(message, `I'm not watching any tickets in this room.`)
  }
}

export default {
  handleListWatch,
  handleUnwatchTicket,
  handleWatchTicket
}
