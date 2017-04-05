import test from 'ava'
import mockBot from './helpers/mockBot'
import { listIssues } from '../src/handlers'

test.beforeEach(t => { mockBot.messages.length = 0 })

test('listIssues', async t => {
  const message = {}
  await listIssues(mockBot, message)

  t.is(mockBot.messages.length, 1)
  const reply = mockBot.messages[0]
  t.true(reply.startsWith('Open issues are:'))
  t.true(reply.includes('TEST-1'))
})

