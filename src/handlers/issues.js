import { getIssues, findUsers, linkToIssue } from '../jira'

const formatIssues = (issues) =>
  issues.map(issue => {
    const link = linkToIssue(issue)
    return `* [${issue.key}](${link}) - ${issue.fields.summary}`
  }).join('\n')

export const listMyIssues = (bot, message) =>
  listIssuesFor(bot, message, message.user)

export const listIssuesForUser = (bot, message) =>
  listIssuesFor(bot, message, message.match[message.match.length - 1])

export const listIssuesFor = async (bot, message, username) => {
  const users = await findUsers(username)

  if (users.length == 0) {
    bot.reply(message, `Could not find any users matching "${username}"`)
  } else if (users.length !== 1) {
    bot.reply(message, `Expected 1 user, but found ${users.length}. Please be more specific.`)
  } else {
    const user = users[0]
    const { issues, total } = await getIssues(user.key)

    let reply
    if (!total) {
      reply = `I found no open issues for ${user.displayName}`
    } else {
      const issuesStr = formatIssues(issues)
      reply = (
        `I found ${total} open issue(s) for ${user.displayName}. They are:\n${issuesStr}`
      )
    }
    bot.reply(message, reply)
  }
}

export const handleJoin = (bot, message) => {
  bot.reply(message, 'This trusty JIRA bot is here to help.')
}

export default {
  handleJoin,
  listIssuesForUser,
  listMyIssues
}
