import 'babel-polyfill'
import controller from './controller'
import startServer from './server'
import attachHandlers from './attachHandlers'

const bot = controller.spawn({})

startServer(controller, bot)

attachHandlers(controller)
