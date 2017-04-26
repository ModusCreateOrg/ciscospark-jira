export default (controller, handlers) => {
  controller.on('bot_space_join', handlers.issues.handleJoin)

  controller.on('jira:issue_comment_edited', handlers.webhooks.handleIssueCommentEdited)
  controller.on('jira:issue_created', handlers.webhooks.handleIssueCreated)

  controller.hears(['list my open issues'], 'direct_mention,direct_message', handlers.issues.listMyIssues)

  controller.hears([
    'list (open )?issues for (.*)',
    'list (open )?issues assigned to (.*)'
  ], 'direct_mention,direct_message', handlers.issues.listIssuesForUser)

  controller.hears([
    'create (new )?(.*?) (task|story|bug) "(.*)"',
    'create (new )?(.*?) (task|story|bug) (.*)'
  ], 'direct_mention,direct_message', handlers.issues.createIssue)

  controller.hears([
    "what['’]?s the status of ([^?]*)?",
    'what is the status of ([^?]*)?',
    '^status ([^?]*)'
  ], 'direct_mention,direct_message', handlers.issues.getIssueStatus)
}
