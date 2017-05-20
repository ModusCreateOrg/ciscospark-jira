// Accept straight quotes (") and closing/opening quotes (“”)
const quotes = '"“”'

export default (controller, handlers) => {
  controller.on('bot_space_join', handlers.handleJoin)

  controller.on('jira:issue_commented', handlers.webhooks.handleNewIssueComment)
  controller.on('jira:issue_comment_edited', handlers.webhooks.handleIssueCommentEdited)
  controller.on('jira:issue_created', handlers.webhooks.handleIssueCreated)
  controller.on('jira:issue_generic', handlers.webhooks.handleGeneric)
  controller.on('jira:issue_assigned', handlers.webhooks.handleIssueAssigned)

  controller.hears([
    'list (open )?issues for (.*)',
    'list (open )?issues assigned to (.*)'
  ], 'direct_mention,direct_message', handlers.issues.listIssuesForUser)

  controller.hears(['list (my )?open issues'], 'direct_mention,direct_message', handlers.issues.listMyIssues)

  controller.hears([
    `create (new )?(.*?) (.*?) [${quotes}]?([^${quotes}]*)[${quotes}]?`
  ], 'direct_mention,direct_message', handlers.issues.createIssue)

  controller.hears([
    "what['’]?s the status of ([^?]*)?",
    'what is the status of ([^?]*)?',
    '^status ([^?]*)'
  ], 'direct_mention,direct_message', handlers.issues.getIssueStatus)

  controller.hears([
    `(update|set|change) (the )?status of (.*) to [${quotes}]?([^${quotes}]*)[${quotes}]?`
  ], 'direct_mention,direct_message', handlers.issues.updateIssueStatus)

  controller.hears([
    `^comment on ([^ ]*) [${quotes}]?([^${quotes}]*)[${quotes}]?`
  ], 'direct_mention,direct_message', handlers.issues.commentOnIssue)

  controller.hears([
    '^list watched tickets',
    '^what tickets are you watching?'
  ], 'direct_mention,direct_message', handlers.watch.handleListWatch)

  controller.hears([
    '^watch(?: ticket)? (.*)',
    '^start watching(?: ticket)? (.*)'
  ], 'direct_mention,direct_message', handlers.watch.handleWatchTicket)

  controller.hears([
    '^unwatch(?: ticket)? (.*)',
    '^stop watching(?: ticket)? (.*)'
  ], 'direct_mention,direct_message', handlers.watch.handleUnwatchTicket)

  controller.hears([/^setup$/, /^setup webhooks$/], 'direct_mention,direct_message', handlers.handleSetup)

  controller.hears([/^$/, 'help'], 'direct_mention,direct_message', handlers.displayHelp)

  controller.hears(['.*'], 'direct_mention,direct_message', handlers.displayDefaultMessage)
}
