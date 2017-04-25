export default (controller, bot) => {
  controller.setupWebserver(process.env.PORT || 3000, function (err, webserver) {
    if (err) {
      console.log(err)
      throw err
    }
    controller.createWebhookEndpoints(webserver, bot, function () {
      console.log('SPARK: Webhooks set up!')
    })

    webserver.post('/jira/receive', (req, res) => {
      const { body } = req
      const trigger = body.issue_event_type_name ? `jira:${body.issue_event_type_name}` : body.webhookEvent
      console.log(`JIRA: Received webhook for ${trigger}`)
      controller.trigger(trigger, [bot, body])
    })
  })
}
