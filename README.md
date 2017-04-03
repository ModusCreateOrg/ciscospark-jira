# Starter kit for Botkit for Cisco Spark

This is a starter kit for creating bots for [Cisco Spark](https://www.ciscospark.com/)
using [botkit](https://github.com/howdyai/botkit).

You can clone this repo and have a bot deployed to Heroku in just a couple minutes.

## Deploying your own bot

Here are instructions for deploying on Heroku, but this can be adapted to any host.

1. [Create a new bot account](https://developer.ciscospark.com/add-bot.html) on Cisco Spark
1. Clone this repo
1. Create a new app on heroku

        heroku apps:create my-spark-bot

1. Add environment variables to the heroku app to match those in `.env`.
   e.g.

        heroku config:add PUBLIC_ADDRESS=https://my-spark-bot.herokuapp.com

1. Push to heroku

        git push heroku

1. Add your bot to your space.

## Development

### Work on the bot


1. [Create a new bot account](https://developer.ciscospark.com/add-bot.html) on Cisco Spark

1. Clone this repo

1. Install dependencies

        yarn install

1. Copy `.env` to `.env.local` and customize

        cp .env .env.local

1. Start the local development server

        npm run server-dev

1. Run ngrok (or something like it).

    Because Spark uses webhooks to talk to bots, you must run something like ngrok locally to expose your server to the web.
    We've included a script to do this for you (requires ngrok)

        npm run ngrok


### Tests

Run the tests:

    npm test

Run the test watcher:

    npm run test-watch
