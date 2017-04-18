import { sparkbot } from 'botkit'

const controller = sparkbot({
  debug: true,
  log: true,
  public_address: process.env.PUBLIC_ADDRESS || 'https://example.com',
  ciscospark_access_token: process.env.ACCESS_TOKEN || 'token',
  studio_token: process.env.STUDIO_TOKEN
})

export default controller
