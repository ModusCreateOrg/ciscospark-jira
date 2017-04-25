import test from 'ava'
import { core } from 'botkit'

export const messages = []
test.beforeEach(() => { messages.length = 0 })

const messageLogger = function (botkit, config) {
  this.botkit = botkit
  this.config = config

  this.say = (message) => messages.push(message)

  this.replyWithQuestion = (message, question, cb) => {
    botkit.startConversation(message, (convo) => {
      convo.ask(question, cb)
    })
  }

  this.reply = (src, resp) => messages.push(resp)

  this.findConversation = (message, cb) => {
    botkit.debug('DEFAULT FIND CONVO')
    cb(null)
  }
}

export const fakeController = core({ debug: false, log: false })
fakeController.defineBot(messageLogger)

export const bot = fakeController.spawn()
export default bot
