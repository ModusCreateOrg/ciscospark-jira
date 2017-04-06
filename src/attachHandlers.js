import { handleJoin, listIssuesForUser, listMyIssues } from './handlers'

export default (controller) => {
  controller.on('bot_space_join', handleJoin)

  controller.hears(['list my open issues'], 'direct_mention,direct_message', listMyIssues)

  controller.hears([
    'list (open )?issues for (.*)',
    'list (open )?issues assigned to (.*)'
  ], 'direct_mention,direct_message', listIssuesForUser)
}
