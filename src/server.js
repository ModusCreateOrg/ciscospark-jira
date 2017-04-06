export default (controller, bot) => {
  controller.setupWebserver(process.env.PORT || 3000, function (err, webserver) {
    if (err) {
      console.log(err)
      throw err
    }
    controller.createWebhookEndpoints(webserver, bot, function () {
      console.log('SPARK: Webhooks set up!')
    })
  })
}
