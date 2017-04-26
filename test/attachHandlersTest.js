import test from 'ava'
import sinon from 'sinon'
import attachHandlers from '../src/attachHandlers'
import bot, { fakeController } from './helpers/mockBot'

const sendMessage = (text) =>
  fakeController.trigger('direct_mention', [bot, {
    channel: 'foo',
    user: 'randy@butternubs.io',
    text
  }])

const handlers = {
  webhooks: {
    handleIssueCommentEdited: sinon.stub()
  },
  issues: {
    createIssue: sinon.stub(),
    getIssueStatus: sinon.stub(),
    handleJoin: sinon.stub(),
    listMyIssues: sinon.stub(),
    listIssuesForUser: sinon.stub()
  }
}

const resetStubs = () => {
  Object.keys(handlers.webhooks).forEach(handler => handlers.webhooks[handler].reset())
  Object.keys(handlers.issues).forEach(handler => handlers.issues[handler].reset())
}

attachHandlers(fakeController, handlers)

test.beforeEach(resetStubs)

test('bot handles space join event', t => {
  fakeController.trigger('bot_space_join', [bot, {}])
  t.true(handlers.issues.handleJoin.called)
})

test('bot handles jira issue_comment_edited event', t => {
  fakeController.trigger('jira:issue_comment_edited', [bot, {}])
  t.true(handlers.webhooks.handleIssueCommentEdited.called)
})

test('bot handles listing my open issues', t => {
  sendMessage('list my open issues')
  t.true(handlers.issues.listMyIssues.called)
})

test('bot handles listing issues for another user', t => {
  const validMessages = [
    'list issues for george',
    'list open issues for george',
    'list issues assigned to george',
    'list open issues assigned to george'
  ]

  for (const message of validMessages) {
    sendMessage(message)
    t.true(
      handlers.issues.listIssuesForUser.calledOnce,
      `expected handler was not called for message ${message}`
    )
    const { match } = handlers.issues.listIssuesForUser.firstCall.args[1]
    t.is(match[match.length - 1], 'george')

    resetStubs()
  }
})

test('bot handles creating a new issue', t => {
  const validMessages = [
    { type: 'task', message: 'create test task lorem ipsum' },
    { type: 'task', message: 'create new test task lorem ipsum' },
    { type: 'story', message: 'create test story lorem ipsum' },
    { type: 'bug', message: 'create test bug lorem ipsum' },
    { type: 'bug', message: 'create test bug "lorem ipsum"' }
  ]

  for (const message of validMessages) {
    sendMessage(message.message)
    t.true(
      handlers.issues.createIssue.calledOnce,
      `expected handler was not called for message ${message.message}`
    )
    const { match } = handlers.issues.createIssue.firstCall.args[1]
    const [ original, _, project, type, title ] = match
    t.is(original, message.message)
    t.is(project, 'test')
    t.is(type, message.type)
    t.is(title, 'lorem ipsum')

    resetStubs()
  }
})

test('bot handles getting status of an issue', t => {
  const validMessages = [
    "what's the status of TEST-12?",
    "what’s the status of TEST-12?",
    "whats the status of TEST-12?",
    'status TEST-12',
    'what is the status of TEST-12?'
  ]

  for (const message of validMessages) {
    sendMessage(message)
    t.true(
      handlers.issues.getIssueStatus.calledOnce,
      `expected handler was not called for message ${message}`
    )
    const { match } = handlers.issues.getIssueStatus.firstCall.args[1]
    t.is(match[match.length - 1], 'TEST-12')

    resetStubs()
  }
})
