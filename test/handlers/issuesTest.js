import test from 'ava'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import bot, { messages } from '../helpers/mockBot'

const mockIssues = require('../fixtures/search.json')
const mockUsers = require('../fixtures/user_search.json')

const getModuleMock = () => {
  const mocks = {
    getIssues: sinon.stub().returns(mockIssues),
    findUsers: sinon.stub().returns(mockUsers)
  }
  const module = proxyquire('../../src/handlers/issues', {
    '../jira': mocks
  })
  return {
    module,
    mocks
  }
}

test('list my issues for user when issues are found', async t => {
  const { module, mocks } = getModuleMock()
  const { listIssuesFor } = module

  await listIssuesFor(bot, {}, 'randy')

  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.startsWith('I found 3 open issue(s) for Randy Butternubs'))
  t.true(reply.includes('TEST-7'))
})

test('list issues when no users found', async t => {
  const { module, mocks } = getModuleMock()
  const { listIssuesFor } = module
  const { findUsers } = mocks

  findUsers.returns([])

  await listIssuesFor(bot, {}, 'randy')

  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.startsWith('Could not find any users'))
})

test('list issues when multiple users found', async t => {
  const { module, mocks } = getModuleMock()
  const { listIssuesFor } = module
  const { findUsers } = mocks

  findUsers.returns([...mockUsers, ...mockUsers])

  await listIssuesFor(bot, {}, 'randy')

  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.startsWith('Expected 1 user, but found 2.'))
})

test('list issues when no issues found', async t => {
  const { module, mocks } = getModuleMock()
  const { listIssuesFor } = module
  const { getIssues } = mocks

  getIssues.returns([])

  await listIssuesFor(bot, {}, 'randy')

  t.is(messages.length, 1)
  const reply = messages[0]
  t.is(reply, 'I found no open issues for Randy Butternubs')
})
