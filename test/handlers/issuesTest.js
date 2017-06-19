import test from 'ava'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import bot, { messages } from '../helpers/mockBot'

const mockIssues = require('../fixtures/search.json')
const mockIssueTypes = require('../fixtures/issue_types.json')
const mockTransitions = require('../fixtures/transitions.json')
const mockUsers = require('../fixtures/user_search.json')

const getModuleMock = () => {
  const mocks = {
    assignIssue: sinon.stub(),
    createIssue: sinon.stub(),
    commentOnIssue: sinon.stub(),
    getIssue: sinon.stub(),
    getIssues: sinon.stub().returns(mockIssues),
    getIssueTransitions: sinon.stub().returns(mockTransitions),
    getIssueTypes: sinon.stub().returns(mockIssueTypes),
    findUsers: sinon.stub().returns(mockUsers),
    linkToIssue: sinon.stub(),
    updateIssueStatus: sinon.stub()
  }
  const module = proxyquire('../../src/handlers/issues', {
    '../jira': { default: mocks }
  })
  return {
    module,
    mocks
  }
}

test('list my issues for user when issues are found', async t => {
  const { module } = getModuleMock()
  const { listIssuesFor } = module

  await listIssuesFor(bot, {}, 'randy')

  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.startsWith('I found 3 open issues for **Randy Butternubs**'))
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
  t.is(reply, "I'm sorry, I could not find any users matching **\"randy\"**")
})

test('list issues when multiple users found', async t => {
  const { module, mocks } = getModuleMock()
  const { listIssuesFor } = module
  const { findUsers } = mocks

  findUsers.returns([...mockUsers, ...mockUsers])

  await listIssuesFor(bot, {}, 'randy')

  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.trim().startsWith("I'm sorry, I expected 1 user to match **\"randy\"**, but found 2."))
})

test('list issues when no issues found', async t => {
  const { module, mocks } = getModuleMock()
  const { listIssuesFor } = module
  const { getIssues } = mocks

  getIssues.returns([])

  await listIssuesFor(bot, {}, 'randy')

  t.is(messages.length, 1)
  const reply = messages[0]
  t.is(reply, 'I found no open issues for **Randy Butternubs**')
})

test('assign issue when assignment succeeds', async t => {
  const { module } = getModuleMock()
  const { assignIssue } = module

  await assignIssue(bot, { match: ['test-6', 'randy'] })

  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.startsWith("Ok, I've assigned"))
  t.true(reply.includes('test-6'))
  t.true(reply.includes('Randy Butternubs'))
})

test('assign issue when assignment fails', async t => {
  const { module, mocks } = getModuleMock()
  const { assignIssue } = module
  const { assignIssue: assignIssueMock } = mocks
  assignIssueMock.throws({ error: { errors: { oops: 'Some error happened' } } })

  await assignIssue(bot, { match: ['test-6', 'randy'] })

  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.startsWith("I'm sorry, I was unable to assign **\"test-6\"**"))
})

test('assign issue when no users found', async t => {
  const { module, mocks } = getModuleMock()
  const { assignIssue } = module
  const { findUsers } = mocks

  findUsers.returns([])

  await assignIssue(bot, { match: ['test-5', 'randy'] })

  t.is(messages.length, 1)
  const reply = messages[0]
  t.is(reply, "I'm sorry, I could not find any users matching **\"randy\"**")
})

test('assign issue when multiple users found', async t => {
  const { module, mocks } = getModuleMock()
  const { assignIssue } = module
  const { findUsers } = mocks

  findUsers.returns([...mockUsers, ...mockUsers])

  await assignIssue(bot, { match: ['test-5', 'randy'] })

  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.trim().startsWith("I'm sorry, I expected 1 user to match **\"randy\"**, but found 2."))
})

test('create issue succeeds', async t => {
  const { module, mocks } = getModuleMock()
  const { createIssue } = module
  const { createIssue: createIssueMock } = mocks

  const createdIssue = {
    key: 'TEST-17'
  }
  createIssueMock.returns(createdIssue)
  const match = ['create new test task lorem ipsum', 'new ', 'test', 'task', 'lorem ipsum']
  const [project, type, title] = match.slice(-3)

  await createIssue(bot, { match })

  t.true(createIssueMock.calledWith(project, type, title))

  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.includes('TEST-17'))
})

test('create issue fails with unknown error', async t => {
  const { module, mocks } = getModuleMock()
  const { createIssue } = module
  const { createIssue: createIssueMock } = mocks

  createIssueMock.throws({ error: { errors: { oops: 'Some error happened' } } })
  const match = ['create test issue lorem ipsum', undefined, 'test', 'issue', 'lorem ipsum']

  await createIssue(bot, { match })

  t.is(messages.length, 1)
  const reply = messages[0]
  t.is(reply, "I'm sorry, I was unable to create the issue")
})

test('create issue fails with issuetype error', async t => {
  const { module, mocks } = getModuleMock()
  const { createIssue } = module
  const { createIssue: createIssueMock } = mocks

  createIssueMock.throws({ error: { errors: { issuetype: 'Unknown issue type' } } })
  const match = ['create test foobar lorem ipsum', undefined, 'test', 'foobar', 'lorem ipsum']

  await createIssue(bot, { match })

  t.is(messages.length, 1)
  const reply = messages[0]
  t.is(reply, `**"foobar"** is not a valid ticket type. Valid types are: \n* Bug\n* Story\n* Task`)
})

test('expand issue succeeds', async t => {
  const { module, mocks } = getModuleMock()
  const { expandIssue } = module
  const { getIssue: getIssueMock } = mocks
  const issue = {
    key: 'TEST-12',
    fields: {
      assignee: {
        name: 'randy',
        displayName: 'Randy Butternubs'
      },
      summary: 'Example issue',
      status: {
        name: 'In Progress'
      }
    }
  }
  getIssueMock.returns(issue)

  await expandIssue(bot, { match: ['what about TEST-12?', 'TEST-12'] })

  t.true(getIssueMock.calledWith('TEST-12'))
  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.includes('Example issue'))
  t.true(reply.includes('(In Progress) Assigned to **Randy Butternubs** (_randy_)'))
})

test('expand issue succeeds with unassigned issue', async t => {
  const { module, mocks } = getModuleMock()
  const { expandIssue } = module
  const { getIssue: getIssueMock } = mocks
  const issue = {
    key: 'TEST-12',
    fields: {
      summary: 'Example issue',
      status: {
        name: 'Backlog'
      }
    }
  }
  getIssueMock.returns(issue)

  await expandIssue(bot, { match: ['what about TEST-12?', 'TEST-12'] })

  t.true(getIssueMock.calledWith('TEST-12'))
  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.includes('Example issue'))
  t.true(reply.includes('(Backlog) _Unassigned_'))
})

test('expand issue fails', async t => {
  const { module, mocks } = getModuleMock()
  const { expandIssue } = module
  const { getIssue: getIssueMock } = mocks
  getIssueMock.throws({ error: 'Could not find issue' })

  await expandIssue(bot, { match: ['what about TEST-12?', 'TEST-12'] })

  t.true(getIssueMock.calledWith('TEST-12'))
  t.is(messages.length, 0)
})

test('get issue status succeeds', async t => {
  const { module, mocks } = getModuleMock()
  const { getIssueStatus } = module
  const { getIssue: getIssueMock } = mocks
  const issue = {
    key: 'TEST-12',
    fields: {
      summary: 'Example issue',
      status: {
        name: 'In Progress'
      }
    }
  }
  getIssueMock.returns(issue)

  await getIssueStatus(bot, { match: ['status TEST-12', 'TEST-12'] })

  t.true(getIssueMock.calledWith('TEST-12'))
  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.includes('has status In Progress'))
})

test('get issue status fails', async t => {
  const { module, mocks } = getModuleMock()
  const { getIssueStatus } = module
  const { getIssue: getIssueMock } = mocks
  const error = { errorMessages: ['Ya dun goofed'] }
  getIssueMock.throws({ error })

  await getIssueStatus(bot, { match: ['status TEST-12', 'TEST-12'] })

  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.includes(error.errorMessages[0]))
})

test('update issue status with unknown transition', async t => {
  const { module } = getModuleMock()
  const { updateIssueStatus } = module

  const match = ['update status of test-1 to unknown status', undefined, 'test-1', 'unknown status']

  await updateIssueStatus(bot, { match })

  t.is(messages.length, 1)
  const reply = messages[0]
  t.is(reply, `I couldn't find any transition for **"unknown status"**. Valid options are: \n* Backlog\n* Selected for Development\n* In Progress\n* Done`)
})

test('update issue status fails when updating transition', async t => {
  const { module, mocks } = getModuleMock()
  const { updateIssueStatus } = module
  const { updateIssueStatus: updateIssueStatusMock } = mocks
  const error = { errorMessages: ['Invalid transition attempted'] }
  updateIssueStatusMock.throws({ error })

  const match = ['update status of test-1 to in progress', undefined, 'test-1', 'in progress']

  await updateIssueStatus(bot, { match })

  t.true(updateIssueStatusMock.calledWith('test-1', '31'))
  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.includes(error.errorMessages[0]))
})

test('update issue status succeeds', async t => {
  const { module, mocks } = getModuleMock()
  const { updateIssueStatus } = module
  const { updateIssueStatus: updateIssueStatusMock } = mocks

  const match = ['update status of test-1 to in progress', undefined, 'test-1', 'in progress']

  await updateIssueStatus(bot, { match })

  t.true(updateIssueStatusMock.calledWith('test-1', '31'))
  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.startsWith("Ok, I've updated the status"))
})

test('comment on issue succeeds', async t => {
  const { module, mocks } = getModuleMock()
  const { commentOnIssue } = module
  const { commentOnIssue: commentOnIssueMock } = mocks
  const comment = { id: 62 }
  commentOnIssueMock.returns(comment)

  await commentOnIssue(bot, { match: ['comment on TEST-12 foo', 'TEST-12', 'foo'] })

  t.true(commentOnIssueMock.calledWith('TEST-12', 'foo'))
  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.includes("I've added your comment"))
})

test('get issue status fails', async t => {
  const { module, mocks } = getModuleMock()
  const { commentOnIssue } = module
  const { commentOnIssue: commentOnIssueMock } = mocks
  const error = { errorMessages: ['Ya dun goofed'] }
  commentOnIssueMock.throws({ error })

  await commentOnIssue(bot, { match: ['status TEST-12', 'TEST-12'] })

  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.includes(error.errorMessages[0]))
})
