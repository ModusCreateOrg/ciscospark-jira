import test from 'ava'
import bot, { messages } from './helpers/mockBot'
import { listMyIssues } from '../src/handlers'

test('listIssues', async t => {
  const message = { user: 'randy' }
  await listMyIssues(bot, message)

  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.startsWith('I found 3 open issue(s)'))
  t.true(reply.includes('TEST-7'))
})
