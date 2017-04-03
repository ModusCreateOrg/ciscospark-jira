import { sparkbot } from 'Botkit'

const controller = sparkbot({
  debug: true,
  log: true,
  public_address: process.env.PUBLIC_ADDRESS,
  ciscospark_access_token: process.env.ACCESS_TOKEN,
  studio_token: process.env.STUDIO_TOKEN
})

export default controller
