# Jira bot for Cisco Spark

This is a bot for Cisco Spark that integrates with Jira.

## Spark Configuration

In order for the bot to communicate with Cisco Spark, a couple configuration values
are expected to exist in the environment (or `.env` or `.env.local` files):

* `PUBLIC_ADDRESS` - the address at which your bot can be reached.
* `ACCESS_TOKEN` - the bot's access token from Cisco Spark

## Jira Configuration

In order for the bot to talk with Jira a couple configuration values are required:

* `JIRA_HOST` - the URL to the Jira instance (`https://YOUR_SUBDOMAIN.atlassian.net` for example)
* `JIRA_USERNAME` and `JIRA_PASSWORD` - the username and password used to authenticate with the Jira API. Changes made to Jira will be performed by this user, so you may want to create a special bot account.

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

        yarn server-dev

1. Run ngrok (or something like it).

    Because Spark uses webhooks to talk to bots, you must run something like ngrok locally to expose your server to the web.
    We've included a script to do this for you (requires ngrok)

        yarn ngrok


### Tests

Run the tests:

    yarn test

Run the test watcher:

    yarn test-watch
