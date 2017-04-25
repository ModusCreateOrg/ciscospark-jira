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
  createIssue: sinon.stub(),
  handleJoin: sinon.stub(),
  handleIssueCommentEdited: sinon.stub(),
  listMyIssues: sinon.stub(),
  listIssuesForUser: sinon.stub()
}

const resetStubs = () => {
  Object.keys(handlers).forEach(handler => handlers[handler].reset())
}

attachHandlers(fakeController, handlers)

test.beforeEach(resetStubs)

test('bot handles space join event', t => {
  fakeController.trigger('bot_space_join', [bot, {}])
  t.true(handlers.handleJoin.called)
})

test('bot handles jira issue_comment_edited event', t => {
  fakeController.trigger('jira:issue_comment_edited', [bot, {}])
  t.true(handlers.handleIssueCommentEdited.called)
})

test('bot handles listing my open issues', t => {
  sendMessage('list my open issues')
  t.true(handlers.listMyIssues.called)
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
      handlers.listIssuesForUser.calledOnce,
      `expected handler was not called for message ${message}`
    )
    const { match } = handlers.listIssuesForUser.firstCall.args[1]
    t.is(match[match.length - 1], 'george')

    resetStubs()
  }
})

test('bot handles creating a new issue', t => {
  const validMessages = [
    { type: 'issue', message: 'create test issue lorem ipsum' },
    { type: 'story', message: 'create test story lorem ipsum' },
    { type: 'bug', message: 'create test bug lorem ipsum' }
  ]

  for (const message of validMessages) {
    sendMessage(message.message)
    t.true(
      handlers.createIssue.calledOnce,
      `expected handler was not called for message ${message}`
    )
    const { match } = handlers.createIssue.firstCall.args[1]
    const [ original, project, type, title ] = match
    t.is(original, message.message)
    t.is(project, 'test')
    t.is(type, message.type)
    t.is(title, 'lorem ipsum')

    resetStubs()
  }
})
