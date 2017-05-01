import { linkToIssue } from '../jira'
import replyToWebhook from '../utils/replyToWebhook'

const linkWithKeyAndTitle = (issue) =>
  `[${issue.key} - ${issue.fields.summary}](${linkToIssue(issue)})`

export const handleIssueCommentEdited = (bot, event) => {
  const { comment, issue, user } = event
  const link = `${linkToIssue(issue)}?focusedCommentId=${comment.id}#comment-${comment.id}`
  const message = `${user.displayName} edited a comment on [${issue.key}](${link})`
  replyToWebhook(bot, message, issue.key)
}

export const handleIssueCreated = (bot, event) => {
  const { issue, user } = event
  const message = `${user.displayName} created a new issue: ${linkWithKeyAndTitle(issue)}`
  replyToWebhook(bot, message, issue.key)
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
    ${linkWithKeyAndTitle(issue)} \
    changed status from **${update.fromString}** to **${update.toString}**
  `
  replyToWebhook(bot, message, issue.key)
}

export const handleIssueAssigned = (bot, event) => {
  const { issue } = event
  const message = `
    ${linkWithKeyAndTitle(issue)} \
    has been assigned to ${issue.fields.assignee.displayName}
  `
  replyToWebhook(bot, message, issue.key)
}

export default {
  handleIssueAssigned,
  handleIssueCommentEdited,
  handleIssueCreated,
  handleGeneric
}
