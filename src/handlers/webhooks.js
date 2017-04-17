import controller from '../controller'

export const handleIssueCommentEdited = (bot, event) => {
  const message = `${event.user.displayName} edited a comment on ${event.issue.key}`

  controller.api.rooms.list().then((rooms) => {
    let roomId

    rooms.items.forEach((room) => {
      if (room.title.toLowerCase() === process.env.JIRA_WEBHOOK_ROOM.toLowerCase()) {
        roomId = room.id
      }
    })

    if (roomId) {
      bot.reply({ channel: roomId }, message)
    } else {
      console.log(`JIRA webhook handler: I am not a member of a room name "${process.env.JIRA_WEBHOOK_ROOM}"`)
    }
  })
}

export default {
  handleIssueCommentEdited
}
