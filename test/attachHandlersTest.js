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

const testMessages = (t, validMessages, expectedHandler, expectedMatches) => {
  for (const message of validMessages) {
    sendMessage(message)
    t.true(
      expectedHandler.calledOnce,
      `expected handler was not called for message ${message}`
    )
    const { match } = expectedHandler.firstCall.args[1]
    if (expectedMatches.length) {
      t.deepEqual(match.slice(-expectedMatches.length), expectedMatches)
    }

    resetStubs()
  }
}

const handlers = {
  handleJoin: sinon.stub(),
  watch: {
    handleListWatch: sinon.stub(),
    handleUnwatchTicket: sinon.stub(),
    handleWatchTicket: sinon.stub()
  },
  webhooks: {
    handleIssueCommentEdited: sinon.stub()
  },
  issues: {
    commentOnIssue: sinon.stub(),
    createIssue: sinon.stub(),
    getIssueStatus: sinon.stub(),
    listMyIssues: sinon.stub(),
    listIssuesForUser: sinon.stub()
  }
}

const resetStubs = () => {
  Object.keys(handlers.watch).forEach(handler => handlers.watch[handler].reset())
  Object.keys(handlers.webhooks).forEach(handler => handlers.webhooks[handler].reset())
  Object.keys(handlers.issues).forEach(handler => handlers.issues[handler].reset())
}

attachHandlers(fakeController, handlers)

test.beforeEach(resetStubs)

test('bot handles space join event', t => {
  fakeController.trigger('bot_space_join', [bot, {}])
  t.true(handlers.handleJoin.called)
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
  testMessages(t, validMessages, handlers.issues.listIssuesForUser, ['george'])
})

test('bot handles creating a new issue', t => {
  const validMessages = [
    { type: 'task', message: 'create test task lorem ipsum' },
    { type: 'task', message: 'create new test task lorem ipsum' },
    { type: 'story', message: 'create test story lorem ipsum' },
    { type: 'bug', message: 'create test bug lorem ipsum' },
    { type: 'bug', message: 'create test bug "lorem ipsum"' },
    { type: 'bug', message: 'create test bug “lorem ipsum”' }
  ]

  const handler = handlers.issues.createIssue
  for (const message of validMessages) {
    sendMessage(message.message)
    t.true(
      handler.calledOnce,
      `expected handler was not called for message ${message.message}`
    )
    const { match } = handler.firstCall.args[1]
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
    'what’s the status of TEST-12?',
    'whats the status of TEST-12?',
    'status TEST-12',
    'what is the status of TEST-12?'
  ]
  testMessages(t, validMessages, handlers.issues.getIssueStatus, ['TEST-12'])
})

test('bot handles commenting on an issue', t => {
  const validMessages = [
    'comment on TEST-12 this is my comment',
    'comment on TEST-12 "this is my comment"',
    'comment on TEST-12 “this is my comment"',
    'comment on TEST-12 “this is my comment”'
  ]
  testMessages(t, validMessages, handlers.issues.commentOnIssue, ['TEST-12', 'this is my comment'])
})

test('bot handles watching a ticket', t => {
  const validMessages = [
    'start watching TEST-17',
    'start watching ticket TEST-17',
    'watch TEST-17',
    'watch ticket TEST-17'
  ]
  testMessages(t, validMessages, handlers.watch.handleWatchTicket, ['TEST-17'])
})

test('bot handles unwatching a ticket', t => {
  const validMessages = [
    'stop watching TEST-17',
    'stop watching ticket TEST-17',
    'unwatch TEST-17',
    'unwatch ticket TEST-17'
  ]
  testMessages(t, validMessages, handlers.watch.handleUnwatchTicket, ['TEST-17'])
})

test('bot handles listing watched tickets', t => {
  const validMessages = [
    'what tickets are you watching?',
    'list watched tickets'
  ]
  testMessages(t, validMessages, handlers.watch.handleListWatch, [])
})
