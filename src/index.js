import 'babel-polyfill'
import controller from './controller'
import { handleJoin, listIssues } from './handlers'

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

controller.hears(['list'], 'direct_mention,direct_message', listIssues)
