import test from 'ava'
import sinon from 'sinon'
import proxyquire from 'proxyquire'
import bot from '../helpers/mockBot'

const issueKey = 'TEST-12'
const webhookEvent = {
  comment: {
    id: 10101
  },
  user: {
    displayName: 'Randy Butternubs'
  },
  issue: {
    key: issueKey
  },
  issue_event_type_name: 'issue_comment_edited',
  webhookEvent: 'jira:issue_updated'
}

const replyToWebhookStub = sinon.stub()
const resetStubs = () => replyToWebhookStub.reset()

test.beforeEach(resetStubs)

const getModule = () => {
  return proxyquire('../../src/handlers/webhooks', {
    '../utils/replyToWebhook': {
      default: replyToWebhookStub
    }
  })
}

const assertStubCalledWith = (t, bot, reply, issueKey) => {
  t.true(replyToWebhookStub.calledOnce)

  const [callBot, callReply, callIssueKey] = replyToWebhookStub.firstCall.args
  t.is(callBot, bot)
  t.is(callReply.replace(/\s+/g, ' ').trim(), reply)
  t.is(callIssueKey, issueKey)
}

test('sends notification when issue comment edited', async t => {
  const { handleIssueCommentEdited } = getModule()

  await handleIssueCommentEdited(bot, webhookEvent)

  assertStubCalledWith(t,
    bot,
    `Randy Butternubs edited a comment on [TEST-12](${process.env.JIRA_HOST}/browse/TEST-12?focusedCommentId=10101#comment-10101)`,
    issueKey
  )
})

test('sends notification when issue created', async t => {
  const { handleIssueCreated } = getModule()

  const createIssueEvent = {
    user: {
      displayName: 'Randy Butternubs'
    },
    issue: {
      key: 'TEST-12',
      fields: {
        summary: 'This is a new issue'
      }
    }
  }
  await handleIssueCreated(bot, createIssueEvent)

  assertStubCalledWith(t,
    bot,
    `Randy Butternubs created a new issue: [TEST-12 - This is a new issue](${process.env.JIRA_HOST}/browse/TEST-12)`,
    issueKey
  )
})

test('sends notification when issue status updated', async t => {
  const { handleGeneric } = getModule()

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

  assertStubCalledWith(t,
    bot,
    `[TEST-12 - Example issue](${process.env.JIRA_HOST}/browse/TEST-12) changed status from **In Progress** to **Done**`,
    issueKey
  )
})

test('sends notification when issue assigned', async t => {
  const { handleIssueAssigned } = getModule()

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

  assertStubCalledWith(t,
    bot,
    `[TEST-12 - Example issue](${process.env.JIRA_HOST}/browse/TEST-12) has been assigned to Randy Butternubs`,
    issueKey
  )
})
