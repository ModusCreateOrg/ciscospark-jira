import test from 'ava'
import sinon from 'sinon'
import { api, findUsers, getIssues } from '../src/jira'

let getStub, postStub

test.beforeEach(t => {
  getStub = sinon.stub(api, 'get')
  postStub = sinon.stub(api, 'post')
})
test.afterEach(t => {
  getStub.restore()
  postStub.restore()
})

test('findUsers', async t => {
  const username = 'randy'

  const result = await findUsers(username)
  t.true(getStub.calledWith('/user/search', { qs: { username } }))
})

test.serial('get issues without user', async t => {
  const result = await getIssues()
  t.true(postStub.calledWith('/search', {
    body: {
      jql: 'resolution = "Unresolved"',
      fields: ['summary']
    }
  }))
})

test.serial('get issues for user', async t => {
  const result = await getIssues('randy')
  t.true(postStub.calledWith('/search', {
    body: {
      jql: 'resolution = "Unresolved" AND assignee = "randy"',
      fields: ['summary']
    }
  }))
})
