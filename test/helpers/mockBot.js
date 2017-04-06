import sinon from 'sinon'

export const convo = (reply) => ({
  say: sinon.stub().callsFake((message) => reply(message))
})

export const messages = []
export const addMessage = (message) => messages.push(message)

export const bot = {
  messages,
  startConversation: async (message, callback) => {
    await callback(null, convo(addMessage))
  },
  reply: sinon.stub().callsFake((_, message) => addMessage(message))
}

export default bot
