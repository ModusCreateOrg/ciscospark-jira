import 'babel-polyfill'
import controller from './controller'
import { handleJoin, listIssuesForUser, listMyIssues } from './handlers'

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

controller.hears(['list my open issues'], 'direct_mention,direct_message', listMyIssues)

controller.hears([
  'list issues for (.*)',
  'list issues assigned to (.*)'
], 'direct_mention,direct_message', listIssuesForUser)
