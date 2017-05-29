import test from 'ava'
import proxyquire from 'proxyquire'
import bot, { fakeController, messages } from '../helpers/mockBot'

const getModule = () =>
  proxyquire('../../src/handlers/watch', {
    '../controller': {
      default: fakeController
    }
  })

const roomId = 'some room id'
const message = {
  channel: roomId,
  match: ['start watching test-17', 'test-17']
}
const expectedTicketKey = 'TEST-17'

test('handle newly watched ticket', async t => {
  const { handleWatchTicket } = getModule()
  await handleWatchTicket(bot, message)

  const ticket = await fakeController.storage.tickets.get(expectedTicketKey)
  t.deepEqual(ticket.rooms, [roomId])
  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.startsWith('Ok, I will notify you of changes to'))
  t.true(reply.includes('TEST-17'))
})

test('handle ticket watched in another room', async t => {
  await fakeController.storage.tickets.save({ id: expectedTicketKey, rooms: ['some other room'] })
  const { handleWatchTicket } = getModule()
  await handleWatchTicket(bot, message)

  const ticket = await fakeController.storage.tickets.get(expectedTicketKey)
  t.deepEqual(ticket.rooms, ['some other room', roomId])
  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.startsWith('Ok, I will notify you of changes to'))
  t.true(reply.includes('TEST-17'))
})

test('handle previously watched ticket', async t => {
  await fakeController.storage.tickets.save({ id: expectedTicketKey, rooms: [roomId] })
  const { handleWatchTicket } = getModule()
  await handleWatchTicket(bot, message)

  const ticket = await fakeController.storage.tickets.get(expectedTicketKey)
  t.deepEqual(ticket.rooms, [roomId])
  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.startsWith('Ok, I will notify you of changes to'))
  t.true(reply.includes('TEST-17'))
})

test('handle unwatch watched ticket', async t => {
  await fakeController.storage.tickets.save({ id: expectedTicketKey, rooms: ['some other room', roomId] })
  const { handleUnwatchTicket } = getModule()
  await handleUnwatchTicket(bot, message)

  const ticket = await fakeController.storage.tickets.get(expectedTicketKey)
  t.deepEqual(ticket.rooms, ['some other room'])
  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.startsWith('Ok, I will no longer notify you of changes to'))
  t.true(reply.includes('TEST-17'))
})

test('handle unwatch ticket that is not watched', async t => {
  const { handleUnwatchTicket } = getModule()
  await handleUnwatchTicket(bot, message)

  const ticket = await fakeController.storage.tickets.get(expectedTicketKey)
  t.falsy(ticket)
  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.startsWith('Ok, I will no longer notify you of changes to'))
  t.true(reply.includes('TEST-17'))
})

test('handle list watched tickets when room is JIRA_WEBHOOK_ROOM', async t => {
  process.env.JIRA_WEBHOOK_ROOM = message.channel
  const { handleListWatch } = getModule()
  await handleListWatch(bot, message)

  t.is(messages.length, 1)
  t.is(messages[0], 'I will post updates to any tickets that I receive to this channel.')
  process.env.JIRA_WEBHOOK_ROOM = null
})

test('handle list watched tickets when not watching any tickets', async t => {
  const { handleListWatch } = getModule()
  await handleListWatch(bot, message)

  t.is(messages.length, 1)
  t.is(messages[0], "I'm not watching any tickets in this room.")
})

test('handle list watched tickets when watching a ticket', async t => {
  await fakeController.storage.tickets.save({ id: expectedTicketKey, rooms: ['some other room', roomId] })
  const { handleListWatch } = getModule()
  await handleListWatch(bot, message)

  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.startsWith("I'm watching the following tickets and will post updates to this room"))
  t.true(reply.includes('TEST-17'))
})

test('handle list watched tickets when watching multiple ticket', async t => {
  await fakeController.storage.tickets.save({ id: expectedTicketKey, rooms: ['some other room', roomId] })
  await fakeController.storage.tickets.save({ id: 'TEST-1', rooms: [roomId] })
  const { handleListWatch } = getModule()
  await handleListWatch(bot, message)

  t.is(messages.length, 1)
  const reply = messages[0]
  t.true(reply.startsWith("I'm watching the following tickets and will post updates to this room"))
  t.true(reply.includes('TEST-1'))
  t.true(reply.includes('TEST-17'))
})
