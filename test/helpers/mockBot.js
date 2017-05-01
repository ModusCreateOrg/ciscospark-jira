import test from 'ava'
import { core } from 'botkit'
import promisify from 'promisify-node'

export const sources = []
export const messages = []
test.beforeEach(() => {
  messages.length = 0
  sources.length = 0
})

const messageLogger = function (botkit, config) {
  this.botkit = botkit
  this.config = config

  this.say = (message) => messages.push(message)

  this.replyWithQuestion = (message, question, cb) => {
    botkit.startConversation(message, (convo) => {
      convo.ask(question, cb)
    })
  }

  this.reply = (src, resp) => (sources.push(src) && messages.push(resp))

  this.findConversation = (message, cb) => {
    botkit.debug('DEFAULT FIND CONVO')
    cb(null)
  }
}

export const fakeController = core({ debug: false, log: false })
fakeController.defineBot(messageLogger)

fakeController.storage.tickets = promisify({
  get: function (ticketId, cb) {
    cb(null, fakeController.memory_store.tickets[ticketId])
  },
  save: function (ticket, cb) {
    if (ticket.id) {
      fakeController.memory_store.tickets[ticket.id] = ticket
      cb(null, ticket.id)
    } else {
      cb('No ID specified')
    }
  },
  all: function (cb) {
    cb(null, Object.values(fakeController.memory_store.tickets))
  }
})
fakeController.memory_store.tickets = {}
test.afterEach(() => { fakeController.memory_store.tickets = {} })

export const bot = fakeController.spawn()
export default bot
