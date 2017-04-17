import { handleJoin, listIssuesForUser, listMyIssues } from './issues'
import { handleIssueCommentEdited } from './webhooks'

export default {
  handleIssueCommentEdited,
  handleJoin,
  listIssuesForUser,
  listMyIssues
}
