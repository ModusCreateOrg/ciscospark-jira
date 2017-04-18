import { handleJoin, listIssuesForUser, listMyIssues } from './issues'
import { handleIssueCreated, handleIssueCommentEdited } from './webhooks'

export default {
  handleIssueCreated,
  handleIssueCommentEdited,
  handleJoin,
  listIssuesForUser,
  listMyIssues
}
