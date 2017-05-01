import controller from '../controller'

export const replyToWebhook = async (bot, reply, issueKey) => {
  const ticket = await controller.storage.tickets.get(issueKey)

  if (!ticket) {
    console.log(`INFO: Got webhook update for issue ${issueKey} but am not watching that issue`)
  } else {
    ticket.rooms.forEach(roomId => bot.reply({ channel: roomId }, reply))
  }

  if (process.env.JIRA_WEBHOOK_ROOM) {
    bot.reply({ channel: process.env.JIRA_WEBHOOK_ROOM }, reply)
  }
}

export default replyToWebhook
