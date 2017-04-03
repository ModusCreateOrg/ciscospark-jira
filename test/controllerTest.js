import test from 'ava'
import mockBot from './helpers/mockBot'
import { handleDirectMention } from '../src/handlers'

test('Welcome', t => {
  const message = {}
  handleDirectMention(mockBot, message)

  t.true(mockBot.reply.calledWith(message, 'You mentioned me.'))
})

