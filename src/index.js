import 'babel-polyfill'
import controller from './controller'
import {
  handleDirectMention, handleDirectMessage, handleJoin, handleTestMessage
} from './handlers'

const bot = controller.spawn({})

controller.setupWebserver(process.env.PORT || 3000, function (err, webserver) {
  if (err) {
    console.log(err)
    throw err
  }
  controller.createWebhookEndpoints(webserver, bot, function () {
    console.log('SPARK: Webhooks set up!')
  })
})

controller.on('bot_space_join', handleJoin)

controller.hears(['test'], 'direct_mention,direct_message', handleTestMessage)

controller.on('self_message', function (bot, message) {
  // a reply here could create recursion
  // bot.reply(message, 'You know who just said something? This guy.')
})

controller.on('direct_mention', handleDirectMention)

controller.on('direct_message', handleDirectMessage)
