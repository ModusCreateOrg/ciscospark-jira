import { sparkbot } from 'botkit'
import redisStorage from 'botkit-storage-redis'
import promisify, { callbacks } from 'promisify-node'
import args from 'promisify-node/utils/args'

// Promisify determines if a function can be turned into a promise
// using the name of the last argument to the method. If it's named like a
// callback, assume its a callback. This works for everything except for
// the `all` method of `botkit-storage-redis`, which has a signature of
// `all(cb, options)`. To make this promisify-able, we take advantage of
// being able to pass in a "test" function and check whether either of the last
// two arguments is callback-like.
const promisifyHack = (exports) => (
  callbacks.indexOf(args(exports).slice(-2)[0]) > -1 ||
  callbacks.indexOf(args(exports).slice(-1)[0]) > -1
)

const controller = sparkbot({
  debug: true,
  log: true,
  public_address: process.env.PUBLIC_ADDRESS || 'https://example.com',
  ciscospark_access_token: process.env.ACCESS_TOKEN || 'token',
  studio_token: process.env.STUDIO_TOKEN,
  storage: promisify(redisStorage({
    url: process.env.REDIS_URL,
    methods: ['tickets']
  }), promisifyHack)
})

export default controller
