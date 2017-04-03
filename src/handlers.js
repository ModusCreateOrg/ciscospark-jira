export const handleDirectMessage = (bot, message) => {
  bot.reply(message, 'I got your private message.', (err, worker, message) => {
  })
}

export const handleDirectMention = (bot, message) => bot.reply(message, 'You mentioned me.')

export const handleTestMessage = (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) {
      console.log(err)
      throw err
    }
    convo.say('Hello!')
    convo.say('I am bot')
    convo.ask('What are you?', function (res, convo) {
      convo.say('You said ' + res.text)
      convo.next()
    })
  })
}

export const handleJoin = (bot, message) => {
  bot.reply(message, 'This trusty bot is here to help.')
}
