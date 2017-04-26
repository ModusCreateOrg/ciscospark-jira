import controller from '../controller'
import { linkToIssue } from '../jira'

const replyToWebhook = (bot, reply) => {
  controller.api.rooms.list().then((rooms) => {
    let roomId

    rooms.items.forEach((room) => {
      if (room.title.toLowerCase() === process.env.JIRA_WEBHOOK_ROOM.toLowerCase()) {
        roomId = room.id
      }
    })

    if (roomId) {
      bot.reply({ channel: roomId }, reply)
    } else {
      console.log(`JIRA webhook handler: I am not a member of a room matching "${process.env.JIRA_WEBHOOK_ROOM}"`)
    }
  })
}

export const handleIssueCommentEdited = (bot, event) => {
  const { comment, issue, user } = event
  const link = `${linkToIssue(issue)}?focusedCommentId=${comment.id}#comment-${comment.id}`
  const message = `${user.displayName} edited a comment on [${issue.key}](${link})`
  replyToWebhook(bot, message)
}

export const handleIssueCreated = (bot, event) => {
  const { issue, user } = event
  const message = `${user.displayName} created a new issue: [${issue.key} - ${issue.fields.summary}](${linkToIssue(issue)})`
  replyToWebhook(bot, message)
}

export const handleGeneric = (bot, event) => {
  const { issue, changelog: { items = [] } } = event
  if (items.length) {
    for (let change of items) {
      switch (change.field) {
        case 'status':
          handleStatusUpdate(bot, issue, change)
          break
      }
    }
  }
}

const handleStatusUpdate = (bot, issue, update) => {
  const message = `
    [${issue.key} - ${issue.fields.summary}](${linkToIssue(issue)}) \
    changed status from **${update.fromString}** to **${update.toString}**
  `
  replyToWebhook(bot, message)
}

export default {
  handleIssueCommentEdited,
  handleIssueCreated,
  handleGeneric
}
