import jira from '../jira'

const formatIssues = (issues) =>
  issues.map(issue => {
    const link = jira.linkToIssue(issue)
    return `* [${issue.key}](${link}) - ${issue.fields.summary}`
  }).join('\n')

const getErrorMessage = ({ error }, defaultStr) => {
  const { errorMessages = [] } = error
  return errorMessages.length ? errorMessages[0] : defaultStr
}

export const listMyIssues = (bot, message) =>
  listIssuesFor(bot, message, message.user)

export const listIssuesForUser = (bot, message) =>
  listIssuesFor(bot, message, message.match[message.match.length - 1])

const handleIncorrectUsers = (bot, message, users, username) => {
  if (users.length === 0) {
    bot.reply(message, `Could not find any users matching "${username}"`)
  } else if (users.length !== 1) {
    bot.reply(message, `Expected 1 user, but found ${users.length}. Please be more specific.`)
  }
}

export const listIssuesFor = async (bot, message, username) => {
  const users = await jira.findUsers(username)

  if (users.length !== 1) {
    handleIncorrectUsers(bot, message, users, username)
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

export const assignIssue = async (bot, message) => {
  let [issueKey, username] = message.match.slice(-2)
  if (username === 'me') {
    username = message.user
  }
  const users = await jira.findUsers(username)

  if (users.length !== 1) {
    handleIncorrectUsers(bot, message, users, username)
  } else {
    const user = users[0]
    try {
      await jira.assignIssue(issueKey, user)
    } catch (error) {
      const errorStr = getErrorMessage(error, 'I had trouble getting the issue details')
      bot.reply(message, `I'm sorry, I was unable to assign "${issueKey}". ${errorStr}`)
      return
    }

    const reply = (
      `Ok, I've assigned [${issueKey}](${jira.linkToIssue({ key: issueKey })}) to **${user.displayName}**.`
    )
    bot.reply(message, reply)
  }
}

export const createIssue = async (bot, message) => {
  const [projectKey, issueType, issueSummary] = message.match.slice(-3)

  if (issueType.match(/^epic$/i)) {
    bot.reply(message, "I'm sorry, I'm unable to create Epics at this time.")
    return
  }

  let response
  try {
    response = await jira.createIssue(projectKey, issueType, issueSummary)
  } catch ({ error }) {
    console.log('Create issue failed', error)
    const { errors } = error
    if ('issuetype' in errors) {
      const validTypes = await jira.getIssueTypes()
      const typeListStr = validTypes.map(type => type.name).join(', ')
      bot.reply(
        message,
        `"${issueType}" is not a valid ticket type. Valid types are: ${typeListStr}.`
      )
    } else {
      bot.reply(message, "I'm sorry, I was unable to create the issue")
    }
    return
  }

  bot.reply(message, `[${response.key}](${jira.linkToIssue(response)}) created!`)
}

export const getIssueStatus = async (bot, message) => {
  const issueKey = message.match[message.match.length - 1]
  let response
  try {
    response = await jira.getIssue(issueKey)
  } catch (error) {
    const errorStr = getErrorMessage(error, 'I had trouble getting the issue details')
    bot.reply(message, `I could not get the status for "${issueKey}". ${errorStr}`)
    return
  }
  const { key, fields: { summary, status: { name } } } = response
  bot.reply(message, `[${key} - "${summary}"](${jira.linkToIssue(response)}) has status ${name}`)
}

export const updateIssueStatus = async (bot, message) => {
  const [issueKey, newStatus] = message.match.slice(-2)

  const { transitions } = await jira.getIssueTransitions(issueKey)
  const transition = transitions.find(transition => {
    const { name } = transition
    return name.toLowerCase() === newStatus.toLowerCase()
  })

  if (!transition) {
    const validTransitions = transitions.map(t => t.name).join(', ')
    bot.reply(
      message,
      `I couldn't find any transition for "${newStatus}". Valid options are: ${validTransitions}`
    )
    return
  }

  try {
    await jira.updateIssueStatus(issueKey, transition.id)
  } catch (error) {
    const errorStr = getErrorMessage(error, 'I had trouble transitioning the issue')
    bot.reply(message, `I could not update the status for "${issueKey}". ${errorStr}`)
    return
  }

  bot.reply(
    message,
    `Ok, I've updated the status of [${issueKey}](${jira.linkToIssue({ key: issueKey })}) to **${transition.name}**.`
  )
}

export const commentOnIssue = async (bot, message) => {
  let [issueKey, body] = message.match.slice(-2)

  let displayName
  try {
    const user = await bot.botkit.api.people.get(message.original_message.personId)
    displayName = user.displayName
  } catch (error) {
    console.log(`WARNING: Could not find display name for ${message.user}`)
  }
  if (displayName) {
    body = `${displayName} commented via Cisco Spark:\n\n${body}`
  }

  let response
  try {
    response = await jira.commentOnIssue(issueKey, body)
  } catch (error) {
    const errorStr = getErrorMessage(error, 'I had trouble posting your comment.')
    bot.reply(message, `I could not add your comment on "${issueKey}". ${errorStr}`)
    return
  }
  const { id } = response
  const link = `${jira.linkToIssue({ key: issueKey })}?focusedCommentId=${id}#comment-${id}`
  bot.reply(message, `Ok, I've added your comment to [${issueKey}](${link}).`)
}

export default {
  assignIssue,
  commentOnIssue,
  createIssue,
  getIssueStatus,
  listIssuesForUser,
  listMyIssues,
  updateIssueStatus
}
