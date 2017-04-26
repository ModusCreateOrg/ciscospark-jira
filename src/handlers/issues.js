import jira from '../jira'

const formatIssues = (issues) =>
  issues.map(issue => {
    const link = jira.linkToIssue(issue)
    return `* [${issue.key}](${link}) - ${issue.fields.summary}`
  }).join('\n')

export const listMyIssues = (bot, message) =>
  listIssuesFor(bot, message, message.user)

export const listIssuesForUser = (bot, message) =>
  listIssuesFor(bot, message, message.match[message.match.length - 1])

export const listIssuesFor = async (bot, message, username) => {
  const users = await jira.findUsers(username)

  if (users.length === 0) {
    bot.reply(message, `Could not find any users matching "${username}"`)
  } else if (users.length !== 1) {
    bot.reply(message, `Expected 1 user, but found ${users.length}. Please be more specific.`)
  } else {
    const user = users[0]
    const { issues, total } = await jira.getIssues(user.key)

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

export const createIssue = async (bot, message) => {
  const [projectKey, issueType, issueSummary] = message.match.slice(-3)

  let response
  try {
    response = await jira.createIssue(projectKey, issueType, issueSummary)
  } catch ({ error }) {
    console.log('Create issue failed', error)
    bot.reply(message, "I'm sorry, I was unable to create the issue")
    return
  }

  bot.reply(message, `[${response.key}](${jira.linkToIssue(response)}) created!`)
}

export const getIssueStatus = async (bot, message) => {
  const issueKey = message.match[message.match.length - 1]
  let response
  try {
    response = await jira.getIssue(issueKey)
  } catch ({ error }) {
    const { errorMessages = [] } = error
    const errorStr = errorMessages.length ? errorMessages[0] : 'I had trouble getting the issue details.'
    bot.reply(message, `I could not get the status for "${issueKey}". ${errorStr}`)
    return
  }
  const { key, fields: { summary, status: { name } } } = response
  bot.reply(message, `[${key} - "${summary}"](${jira.linkToIssue(response)}) has status ${name}`)
}

export default {
  createIssue,
  getIssueStatus,
  handleJoin,
  listIssuesForUser,
  listMyIssues
}
