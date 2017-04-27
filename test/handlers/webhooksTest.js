import test from 'ava'
import bot, { messages } from '../helpers/mockBot'
import webhooks from '../../src/handlers/webhooks'

const webhookEvent = {
  comment: {
    id: 10101
  },
  user: {
    displayName: 'Randy Butternubs'
  },
  issue: {
    key: 'TEST-12'
  },
  issue_event_type_name: 'issue_comment_edited',
  webhookEvent: 'jira:issue_updated'
}

test('sends notification when issue comment edited', async t => {
  const { handleIssueCommentEdited } = webhooks

  await handleIssueCommentEdited(bot, webhookEvent)

  t.is(messages.length, 1)
  const reply = messages[0]
  t.is(
    reply,
    `Randy Butternubs edited a comment on [TEST-12](${process.env.JIRA_HOST}/browse/TEST-12?focusedCommentId=10101#comment-10101)`
  )
})

test('sends notification when issue created', async t => {
  const { handleIssueCreated } = webhooks

  const createIssueEvent = {
    user: {
      displayName: 'Randy Butternubs'
    },
    issue: {
      key: 'TEST-11',
      fields: {
        summary: 'This is a new issue'
      }
    }
  }
  await handleIssueCreated(bot, createIssueEvent)

  t.is(messages.length, 1)
  const reply = messages[0]
  t.is(
    reply,
    `Randy Butternubs created a new issue: [TEST-11 - This is a new issue](${process.env.JIRA_HOST}/browse/TEST-11)`
  )
})

test('sends notification when issue status updated', async t => {
  const { handleGeneric } = webhooks

  const statusUpdateEvent = {
    issue: {
      key: 'TEST-12',
      fields: {
        summary: 'Example issue'
      }
    },
    changelog: {
      items: [{
        field: 'status',
        fromString: 'In Progress',
        toString: 'Done'
      }]
    }
  }
  await handleGeneric(bot, statusUpdateEvent)
  t.is(messages.length, 1)
  const reply = messages[0]
  t.is(
    reply.replace(/\s+/g, ' ').trim(),
    `[TEST-12 - Example issue](${process.env.JIRA_HOST}/browse/TEST-12) changed status from **In Progress** to **Done**`
  )
})

test('sends notification when issue assigned', async t => {
  const { handleIssueAssigned } = webhooks

  const issueAssignedEvent = {
    issue: {
      key: 'TEST-12',
      fields: {
        assignee: {
          displayName: 'Randy Butternubs'
        },
        summary: 'Example issue'
      }
    }
  }

  await handleIssueAssigned(bot, issueAssignedEvent)
  t.is(messages.length, 1)
  const reply = messages[0]
  t.is(
    reply.replace(/\s+/g, ' ').trim(),
    `[TEST-12 - Example issue](${process.env.JIRA_HOST}/browse/TEST-12) has been assigned to Randy Butternubs`
  )
})
