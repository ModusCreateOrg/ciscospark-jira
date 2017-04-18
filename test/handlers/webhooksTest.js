import test from 'ava'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import bot, { messages } from '../helpers/mockBot'

const roomName = 'My Spark Room'
const getModuleMock = () => {
  const mocks = {
    default: {
      api: {
        rooms: {
          list: () => {
            return Promise.resolve({
              items: [{
                title: roomName,
                id: '8675309'
              }]
            })
          }
        }
      }
    }
  }
  const module = proxyquire('../../src/handlers/webhooks', {
    '../controller': mocks
  })
  return {
    module,
    mocks
  }
}

const webhookEvent = {
  comment: {
    id: 10101
  },
  user: {
    displayName: "Randy Butternubs"
  },
  issue: {
    key: 'TEST-12'
  },
  issue_event_type_name: "issue_comment_edited",
  webhookEvent: "jira:issue_updated"
}

test('sends notification when issue comment edited', async t => {
  const { module, mocks } = getModuleMock()
  const { handleIssueCommentEdited } = module

  process.env.JIRA_WEBHOOK_ROOM = roomName

  await handleIssueCommentEdited(bot, webhookEvent)

  t.is(messages.length, 1)
  const reply = messages[0]
  t.is(
    reply,
    `Randy Butternubs edited a comment on [TEST-12](${process.env.JIRA_HOST}/browse/TEST-12?focusedCommentId=10101#comment-10101)`
  )
})

test('does not send message when room not found', async t => {
  const { module, mocks } = getModuleMock()
  const { handleIssueCommentEdited } = module

  process.env.JIRA_WEBHOOK_ROOM = 'non existant room'

  await handleIssueCommentEdited(bot, webhookEvent)

  t.is(messages.length, 0)
})

