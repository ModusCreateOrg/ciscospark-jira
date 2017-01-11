import test from 'ava'

test.cb('Welcome', t => {
  // TODO left off here
  const app = require('../src/nextTrain.js')
  const event = {
    'session': {
      'new': true
    },
    'request': {
      'type': 'LaunchRequest'
    }
  }
  const context = {}

  app.handler(event, context, function (error, response) {
    t.regex(response.response.outputSpeech.text, /welcome/i)
    t.end(error)
  })
})

