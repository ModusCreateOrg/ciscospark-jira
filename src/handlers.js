import { getIssues, findUsers } from './jira'

const formatIssues = (issues) =>
  issues.map(issue => `* [${issue.key}](${issue.self}) - ${issue.fields.summary}`).join('\n')

export const listMyIssues = async (bot, message) => {
  return listIssuesFor(bot, message, message.user)
}

export const listIssuesForUser = async (bot, message) => {
  await listIssuesFor(bot, message, message.match[1])
}

export const listIssuesFor = async (bot, message, username) => {
  const users = await findUsers(username)

  if (users.length !== 1) {
    bot.reply(message, `Expected 1 user, but found ${users.length}. Please be more specific.`)
  } else {
    const user = users[0]

    await bot.startConversation(message, async (err, convo) => {
      if (err) {
        console.log(err)
        throw err
      }
      const { issues, total } = await getIssues(user.key)

      let message
      if (!total) {
        message = `I found no open issues for ${user.displayName}`
      } else {
        const issuesStr = formatIssues(issues)
        message = (
          `I found ${total} open issue(s) for ${user.displayName}. They are:\n${issuesStr}`
        )
      }
      convo.say(message)
    })
  }
}

export const handleJoin = (bot, message) => {
  bot.reply(message, 'This trusty JIRA bot is here to help.')
}
