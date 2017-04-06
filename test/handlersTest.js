import test from 'ava'
import mockBot from './helpers/mockBot'
import { listMyIssues } from '../src/handlers'

test.beforeEach(t => { mockBot.messages.length = 0 })

test('listIssues', async t => {
  const message = { user: 'randy' }
  await listMyIssues(mockBot, message)

  t.is(mockBot.messages.length, 1)
  const reply = mockBot.messages[0]
  t.true(reply.startsWith('I found 3 open issue(s)'))
  t.true(reply.includes('TEST-7'))
})
