export default (controller, handlers) => {
  controller.on('bot_space_join', handlers.handleJoin)

  controller.on('jira:issue_comment_edited', handlers.handleIssueCommentEdited)
  controller.on('jira:issue_created', handlers.handleIssueCreated)

  controller.hears(['list my open issues'], 'direct_mention,direct_message', handlers.listMyIssues)

  controller.hears([
    'list (open )?issues for (.*)',
    'list (open )?issues assigned to (.*)'
  ], 'direct_mention,direct_message', handlers.listIssuesForUser)

  controller.hears([
    'create (.*?) (issue|story|bug) "(.*)"',
    'create (.*?) (issue|story|bug) (.*)'
  ], 'direct_mention,direct_message', handlers.createIssue)
}
