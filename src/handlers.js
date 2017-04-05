import { getIssues } from './jira'

const formatIssues = (issues) =>
  issues.map(issue => `* [${issue.key}](${issue.self}) - ${issue.fields.summary}`).join('\n')

export const listIssues = async (bot, message) => {
  await bot.startConversation(message, async (err, convo) => {
    if (err) {
      console.log(err)
      throw err
    }
    const issues = await getIssues()

    const issuesStr = formatIssues(issues)
    convo.say(`Open issues are:\n${issuesStr}`)
  })
}

export const handleJoin = (bot, message) => {
  bot.reply(message, 'This trusty JIRA bot is here to help.')
}
