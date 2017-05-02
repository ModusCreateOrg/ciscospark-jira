import issues from './issues'
import watch from './watch'
import webhooks from './webhooks'
import jira from '../jira'

const displayHelp = (bot, message) => bot.reply(message, `
  Here are some of the things I can do:
  - **list open tickets** — list open issues assigned to you or someone else. For \
    example, to list your own issues, try \`list my open issues\`. To list issues \
    for someone else try \`list open issues for George\`.
  - **create tickets** — I can create a new task, story, or bug for you. You \
    must specify the project, type of ticket and summary. For example: \
    \`create new TEST task "Add more features"\`.
  - **ticket status** — I can find the status of an existing ticket. You can \
    ask, for example, \`what is the status of TEST-12?\`.
  - **comment on a ticket** - To comment on an issue, you can tell me which ticket \
    and your comment: \`comment on TEST-12 "These features are important"\`
  - **watch a ticket** - I can notify you of changes to a particular ticket. \
    To receive notifications about "TEST-12", for example, you can say \
    \`start watching TEST-12\`. To stop receiving notifications, you can tell \
    me to stop watching a ticket: \`stop watching TEST-12\`. To see a list of \
    tickets I'm watching you can use: \`list watched tickets\`.
  - **setup webhooks** — In order to watch tickets, webhooks must be setup. I \
    can assist with setting up webhooks if you use the \`setup webhooks\` command.
  - **help** — display this message
`)

export const handleJoin = (bot, message) =>
  bot.reply(message, 'This trusty JIRA bot is here to help.')

export const handleSetup = async (bot, message) => {
  const isAdmin = await jira.isAdmin()
  if (!isAdmin) {
    bot.reply(message, `
      It appears I don't have adminstrator priveleges on JIRA. A site \
      administrator will need to head over to \
      ${process.env.JIRA_HOST}/plugins/servlet/webhooks and enter \
      \`${process.env.PUBLIC_ADDRESS}jira/receive\` for the webhook URL. I recommend \
      registering for at least the "Issue" events for your requested project.`)
  } else {
    setupWebhooks(bot, message)
  }
}

export const setupWebhooks = async (bot, message) => {
  const webhookName = 'Cisco Spark JIRA Webhook'
  try {
    const existingWebhook = await jira.findWebhook(webhookName)
    if (existingWebhook) {
      await jira.updateWebhook(existingWebhook)
    } else {
      await jira.createWebhook(webhookName)
    }
    const action = existingWebhook ? 'updated' : 'set up'
    bot.reply(message, `
      I've ${action} the "${webhookName}" webhook for you on \
      ${process.env.JIRA_HOST}. To receive updates on a particular ticket, \
      you can tell me which issue to watch: \`start watching TEST-1\`, for example.`)
  } catch (error) {
    console.log('ERROR: Got error when attempting to setup webhook.', error.message)
    bot.reply(message, `
      Woops! Looks like something went wrong when I tried to setup the webhook. \
      A JIRA adminstrator will need to head over to \
      ${process.env.JIRA_HOST}/plugins/servlet/webhooks and enter \
      \`${process.env.PUBLIC_ADDRESS}jira/receive\` for the webhook URL.`)
  }
}

export default {
  displayHelp,
  handleJoin,
  handleSetup,
  issues,
  watch,
  webhooks
}
