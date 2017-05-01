import test from 'ava'
import proxyquire from 'proxyquire'
import bot, { fakeController, messages, sources } from '../helpers/mockBot'

const getModule = () =>
  proxyquire('../../src/utils/replyToWebhook', {
    '../controller': {
      default: fakeController
    }
  })

const rooms = ['room 1 id', 'room 2 id']

test.beforeEach(async () => {
  await fakeController.storage.tickets.save({ id: 'TEST-1', rooms })
})

test('sends replies to watched rooms', async t => {
  const { replyToWebhook } = getModule()
  await replyToWebhook(bot, 'This is my reply', 'TEST-1')

  t.is(messages.length, 2)
  for (let [index, message] of messages.entries()) {
    t.is(message, 'This is my reply')
    t.deepEqual(sources[index], { channel: rooms[index] })
  }
})

test('sends no reply for unwatched tickets', async t => {
  const { replyToWebhook } = getModule()
  await replyToWebhook(bot, 'This is my reply', 'SOME-OTHER-TICKET')

  t.is(messages.length, 0)
})

test('sends a reply to room specified by env variable', async t => {
  const { replyToWebhook } = getModule()
  process.env.JIRA_WEBHOOK_ROOM = 'some room id'
  await replyToWebhook(bot, 'This is my reply', 'SOME-OTHER-TICKET')

  t.is(messages.length, 1)
  t.is(messages[0], 'This is my reply')
  t.deepEqual(sources[0], { channel: 'some room id' })
})
