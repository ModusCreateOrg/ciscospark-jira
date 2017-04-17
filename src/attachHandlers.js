export default (controller, handlers) => {
  const { handleIssueCommentEdited, handleJoin, listIssuesForUser, listMyIssues } = handlers

  controller.on('bot_space_join', handleJoin)

  controller.on('jira:issue_comment_edited', handleIssueCommentEdited)

  controller.hears(['list my open issues'], 'direct_mention,direct_message', listMyIssues)

  controller.hears([
    'list (open )?issues for (.*)',
    'list (open )?issues assigned to (.*)'
  ], 'direct_mention,direct_message', listIssuesForUser)
}
